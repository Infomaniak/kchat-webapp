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

=begin
# Creates and configures a new instance of the Net::HTTP class.
#
# @param uri [URI::Generic] The URI for which to create the HTTP instance.
# @return [Net::HTTP] The new instance of the Net::HTTP class.
=end
def get_http(uri)
  Net::HTTP.new(uri.host, uri.port).tap do |http|
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
  end
end

=begin
# Sends a GET request to fetch the commit SHA of a given tag.
#
# @param tag [String] The tag for which to fetch the commit SHA.
# @return [String] The commit SHA corresponding to the given tag. Throws an error if it fails to fetch the tag.
=end
def get_commit_sha(tag)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/tags/#{tag}")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

  response = get_http(uri).request(request)

  if response.code.to_i == 200
    JSON.parse(response.body)["commit"]["id"]
  else
    raise "Failed to fetch the commit SHA for tag #{tag}"
  end
end

def get_all_tags
  page = 1
  all_tags = []

  loop do
    uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/tags?page=#{page}&per_page=100")
    request = Net::HTTP::Get.new(uri.request_uri)
    request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

    response = get_http(uri).request(request)

    if response.code.to_i == 200
      tags = JSON.parse(response.body)
      break if tags.empty?  # Exit the loop if no more tags are returned

      all_tags.concat(tags)
      page += 1  # Increment the page number for the next request
    else
      raise "Failed to fetch the tags (page #{page})"
    end
  end

  all_tags
end

=begin
# Sends a GET request to fetch all tags and finds the last tag before the given tag.
#
# @param current_tag [String] The current tag.
# @return [String] The name of the last tag before the current tag. Throws an error if it fails to fetch the tags.
=end
def get_last_tag(current_tag)
  all_tags = get_all_tags.select { |tag| tag["name"] =~ /\A\d+\.\d+\.\d+(-next\.\d+)?\z/ && tag["name"] < current_tag }

  if all_tags.empty?
    raise "No previous tags found that meet the criteria."
  else
    all_tags.max_by { |tag| tag["name"] }["name"]
  end
end

=begin
# Sends a POST request to create a changelog for a given tag on a specific branch.
#
# @param tag [String] The tag for which to create the changelog.
# @param branch [String] The branch to commit the changelog changes to.
# @return [String, nil] The body of the server's response. Returns nil if status code is not 201.
=end
def create_changelog(tag, branch)
  puts "Creating changelog for tag #{tag}"
  last_tag = get_last_tag(tag)
  puts "Last tag: #{last_tag}"
  commit_sha = get_commit_sha(last_tag)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/changelog")
  request = Net::HTTP::Post.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  # "branch" => branch,
  request.set_form_data("version" => tag, "from" => commit_sha)

  response = get_http(uri).request(request)
  response.body if response.code.to_i == 201
end

=begin
# Sends a GET request to fetch the changelog for a given tag on a specific branch.
#
# @param tag [String] The tag for which to fetch the changelog.
# @param branch [String] The branch where the changelog changes were committed.
# @return [Array, nil] The changelog if the status code is 200, null otherwise.
=end
def get_changelog(tag)
  puts "Fetching changelog for tag #{tag}"
  last_tag = get_last_tag(tag)
  puts "Last tag: #{last_tag}"
  commit_sha = get_commit_sha(last_tag)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/changelog")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data("version" => tag, "from" => commit_sha)

  response = get_http(uri).request(request)
  JSON.parse(response.body)["notes"] if response.code.to_i == 200
end

=begin
# Sends a POST request to create a release for a given tag.
#
# @param changelog [String] The changelog of the release.
# @return [Boolean] True if the status code is 201, false otherwise.
=end
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

=begin
# Sends a GET request to fetch the merge request with the given IID.
#
# @param mr_iid [Integer] The IID of the merge request to fetch.
# @return [Hash] The fetched merge request. Throws an error if it fails to fetch the merge request or parse the response.
=end
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

=begin
# Sends a PUT request to update the labels of a merge request with the given IID.
#
# @param mr_iid [Integer] The IID of the merge request to update.
# @param labels [Array] The labels to set on the merge request.
# @return [Boolean] True if the status code is 200, false otherwise.
=end
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
  create_changelog(GIT_RELEASE_TAG, branch)
  # Get the relevant entries to update labels and create release
  changelog = get_changelog(GIT_RELEASE_TAG)

  # mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  # Labels
  # mr_numbers.each do |mr_number|
  #   mr = get_merge_request(mr_number)
  #   labels = mr["labels"].reject { |label| label.start_with?("stage::") } + ["stage::prod"]
  #   if mr["labels"].any? { |label| label.start_with?("trello::") }
  #     labels = mr["labels"].reject { |label| label.start_with?("trello::") } + ["trello::All - Done", "trello-sync"]
  #     update_merge_request_labels(mr["iid"], labels)
  #     puts "Updated labels for merge request id #{mr['iid']}. New labels: #{labels.join(", ")}"
  #   end
  # end

  # Release
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
  changelog = get_changelog(GIT_RELEASE_TAG)

  # mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  # mr_numbers.each do |mr_number|
  #   mr = get_merge_request(mr_number)
  #   labels = mr["labels"].reject { |label| label.start_with?("stage::") } + ["stage::next"]
  #   update_merge_request_labels(mr["iid"], labels)
  #   puts "Updated labels for merge request id #{mr['iid']}. New labels: #{labels.join(", ")}"
  # end
  create_release(changelog)
  puts "Creating release for canary tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

# [stable + next] Notify
if /\A\d+\.\d+\.\d+\z/.match?(GIT_RELEASE_TAG) || GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-next\.\d+\z/
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
