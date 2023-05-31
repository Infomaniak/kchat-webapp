require 'json'
require 'net/http'

GITLAB_API_BASE = "https://gitlab.infomaniak.ch/api/v4"
# todo: maybe use env
GITLAB_PROJECT_ID = 3225
GITLAB_ACCESS_TOKEN = ENV['GITLAB_API_TOKEN']
GIT_RELEASE_TAG = ARGV[0]
MILESTONE = ARGV[1]
NOTIFY_CHANNEL = ARGV[2]

def get_http(uri)
  Net::HTTP.new(uri.host, uri.port).tap do |http|
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
  end
end

def create_changelog(tag)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/changelog")
  request = Net::HTTP::Post.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data("version" => tag)

  response = get_http(uri).request(request)
  response.body if response.code.to_i == 201
end

def get_changelog(tag)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/changelog")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data("version" => tag)

  response = get_http(uri).request(request)
  JSON.parse(response.body)["notes"] if response.code.to_i == 200
end

def create_release(changelog)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/releases")
  request = Net::HTTP::Post.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data({
    "name" => GIT_RELEASE_TAG,
    "tag_name" => GIT_RELEASE_TAG,
    "description" => changelog,
    "milestones" => MILESTONE
  })

  response = get_http(uri).request(request)
  response.code.to_i == 201
end

def get_merge_request(mr_iid)
  url = "#{GITLAB_BASE_URL}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}"
  uri = URI.parse(url)
  http = get_http(uri)
  request = Net::HTTP::Get.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_ACCESS_TOKEN })
  response = http.request(request)

  # Check the HTTP response status
  if response.code.to_i >= 400
    raise "HTTP Error: #{response.code} #{response.message}"
  end

  # Parse the JSON response
  JSON.parse(response.body)
rescue JSON::ParserError
  raise "Invalid JSON response from GitLab API"
end


def update_merge_request_labels(mr_iid, labels)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Put.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data("labels" => labels.join(","))

  response = get_http(uri).request(request)
  response.code.to_i == 200
end

# main
create_changelog(GIT_RELEASE_TAG)
changelog = get_changelog(GIT_RELEASE_TAG)

# Update labels if the tag is not a pre-release
if /\d+\.\d+\.\d+/.match?(GIT_RELEASE_TAG)
  puts "Processing full release tag: #{GIT_RELEASE_TAG}"
  mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  mr_numbers.each do |mr_number|
    mr = get_merge_request(mr_number)
    labels = mr["labels"].map { |label| label.gsub(/^trello::/, "") } + ["trello::All - Done"]
    update_merge_request_labels(mr["iid"], labels)
    puts "Updated labels for merge request id #{mr['iid']}. New labels: #{labels.join(", ")}"
  end
end

# Update labels if the tag is a pre-release
if tag =~ /\A\d+\.\d+\.\d+-next\.\d+\z/
  puts "Processing prerelease tag: #{GIT_RELEASE_TAG}"
  mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  mr_numbers.each do |mr_number|
    mr = get_merge_request(mr_number)
    labels = mr["labels"].reject { |label| label.start_with?("stage::") } + ["stage::next"]
    update_merge_request_labels(mr["iid"], labels)
    puts "Updated labels for merge request id #{mr['iid']}. New labels: #{labels.join(", ")}"
  end
end

create_release(changelog)
puts "Creating release for tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"

commit_url = "https://gitlab.infomaniak.ch/kchat/webapp/-/commit/"
mr_url = "https://gitlab.infomaniak.ch/kchat/webapp/-/merge_requests/"

formatted_changelog = changelog.gsub(/kchat\/webapp@/, commit_url).gsub(/kchat\/webapp!/, mr_url)
data = { "text" => formatted_changelog }.to_json
notify_uri = URI.parse(NOTIFY_CHANNEL)
notify_request = Net::HTTP::Post.new(notify_uri.request_uri, { "Content-Type" => "application/json" })
notify_request.body = data

get_http(notify_uri).request(notify_request)
puts "Posted changelog to notification channel"
