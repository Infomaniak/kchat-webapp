require 'json'
require 'net/http'

GITLAB_API_BASE = ENV['CI_API_V4_URL']
GITLAB_PROJECT_ID = ENV['CI_PROJECT_ID']
GITLAB_ACCESS_TOKEN = ENV['GITLAB_API_TOKEN']
GIT_RELEASE_TAG = ARGV[0]
MILESTONE = ARGV[1]
NOTIFY_CHANNEL = ARGV[2]
STABLE_BRANCH = 'stable'
NEXT_BRANCH = 'next'

def get_http(uri)
  Net::HTTP.new(uri.host, uri.port).tap do |http|
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
  end
end

def create_changelog(tag, branch)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/changelog")
  request = Net::HTTP::Post.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data("version" => tag, "branch" => branch)

  response = get_http(uri).request(request)
  response.body if response.code.to_i == 201
end

def get_changelog(tag, branch)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/changelog")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data("version" => tag, "branch" => branch)

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
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  response = get_http(uri).request(request)

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

# [stable] Update labels and changelog
if /\A\d+\.\d+\.\d+\z/.match?(GIT_RELEASE_TAG)
  puts "Processing full release tag: #{GIT_RELEASE_TAG}"
  branch = STABLE_BRANCH
  # Creates the changelog entry on gitlab
  create_changelog(GIT_RELEASE_TAG, branch, "^\\d+\\.\\d+\\.\\d+$")
  # Get the relevant entries to update labels and create release
  changelog = get_changelog(GIT_RELEASE_TAG, branch)
  mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  # --- Labels
  mr_numbers.each do |mr_number|
    mr = get_merge_request(mr_number)
    labels = mr["labels"].reject { |label| label.start_with?("stage::") } + ["stage::prod"]
    if mr["labels"].any? { |label| label.start_with?("trello::") }
      labels = mr["labels"].reject { |label| label.start_with?("trello::") } + ["trello::All - Done", "trello-sync"]
      update_merge_request_labels(mr["iid"], labels)
      puts "Updated labels for merge request id #{mr['iid']}. New labels: #{labels.join(", ")}"
    end
  end

  # --- Release
  create_release(changelog)
  puts "Creating release for tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

# [next] Update labels and changelog
if GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-next\.\d+\z/
  branch = NEXT_BRANCH
  puts "Processing prerelease tag: #{GIT_RELEASE_TAG}"
  # Creates the changelog entry on gitlab
  create_changelog(GIT_RELEASE_TAG, branch)
  # Get the relevant entries to update labels and create release
  changelog = get_changelog(GIT_RELEASE_TAG, branch)
  mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  mr_numbers.each do |mr_number|
    mr = get_merge_request(mr_number)
    labels = mr["labels"].reject { |label| label.start_with?("stage::") } + ["stage::next"]
    update_merge_request_labels(mr["iid"], labels)
    puts "Updated labels for merge request id #{mr['iid']}. New labels: #{labels.join(", ")}"
  end
  create_release(changelog)
  puts "Creating release for tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

# [stable] Notify
# canary changelog can be loopy when there is no prod release for a while, it can be seen in the develop MR anyway.
# || GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-next\.\d+\z/
if /\A\d+\.\d+\.\d+\z/.match?(GIT_RELEASE_TAG)
  commit_url = "https://gitlab.infomaniak.ch/kchat/webapp/-/commit/"
  mr_url = "https://gitlab.infomaniak.ch/kchat/webapp/-/merge_requests/"
  formatted_changelog = changelog.gsub(/kchat\/webapp@/, commit_url).gsub(/kchat\/webapp!/, mr_url)
  data = { "text" => formatted_changelog }.to_json
  notify_uri = URI.parse(NOTIFY_CHANNEL)
  notify_request = Net::HTTP::Post.new(notify_uri.request_uri, { "Content-Type" => "application/json" })
  notify_request.body = data

  get_http(notify_uri).request(notify_request)
  puts "Posted changelog to notification channel"
end
