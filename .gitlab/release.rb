require 'json'
require 'net/http'

GITLAB_BASE_URL = ENV['GITLAB_BASE_URL']
GITLAB_API_BASE = "#{GITLAB_BASE_URL}/api/v4"
GITLAB_PROJECT_ID = ENV['CI_PROJECT_ID']
GITLAB_ACCESS_TOKEN = ENV['GITLAB_API_TOKEN']
REDMINE_DOMAIN = ENV['REDMINE_DOMAIN']
REDMINE_API_KEY = ENV['REDMINE_API_KEY']
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
  is_pre_release = current_tag.include?('-next.') || current_tag.include?('-rc.')
  all_tags = get_all_tags.select { |tag| valid_version?(tag["name"]) }

  current_tag_parts = parse_version(current_tag)
  previous_tags = all_tags.select do |tag|
    is_tag_pre_release = tag["name"].include?('-next.') || tag["name"].include?('-rc.')
    next false if is_pre_release != is_tag_pre_release  # Skip different types of tags
    compare_versions(parse_version(tag["name"]), current_tag_parts) < 0
  end

  if previous_tags.empty?
    raise "No previous tags found that meet the criteria."
  else
    previous_tags.max_by { |tag| parse_version(tag["name"]) }["name"]
  end
end

def valid_version?(version)
  version =~ /\A\d+\.\d+\.\d+(-next\.\d+|-rc\.\d+)?\z/
end

=begin
# Parses a version string into an array of integers for comparison.
# The version string is expected to be in the format 'X.Y.Z', 'X.Y.Z-next.WW' or 'X.Y.Z-rc.WW'.
# Standard versions (without a 'next' part) are represented with -1 as the last element.
#
# @param version [String] The version string to parse.
# @return [Array<Integer>] An array representing the parsed version number.
=end
def parse_version(version)
  # Split the version by '-next.' or '-rc.', whichever comes first
  pre_release_delimiter = version.include?('-rc.') ? '-rc.' : '-next.'
  main, pre_release = version.split(pre_release_delimiter)
  parts = main.split('.').map(&:to_i)  # Parse the main version parts

  # Parse the pre-release part, use -1 for standard versions
  pre_release_part = pre_release ? pre_release.to_i : -1
  parts << pre_release_part
  parts
end

=begin
# Compares two version arrays.
# This method is used to determine if one version is less than, equal to, or greater than another version.
# Each element of the version arrays is compared in sequence. The comparison stops at the first non-equal element or
# when all elements have been compared.
#
# @param v1 [Array<Integer>] The first version array for comparison.
# @param v2 [Array<Integer>] The second version array for comparison.
# @return [Integer] -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2.
=end
def compare_versions(v1, v2)
  length = [v1.length, v2.length].max
  (0...length).each do |i|
    a = v1[i] || 0
    b = v2[i] || 0
    return a <=> b if a != b
  end
  0
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
  bot_message = "Add changelog for version #{tag} [skip ci]"
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/changelog")
  request = Net::HTTP::Post.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  # "branch" => branch,
  request.set_form_data("version" => tag, "from" => commit_sha, "message" => bot_message)

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

# =begin
# Helper method to fetch current labels with the given IID.
#
# @param mr_iid [Integer] The IID of the merge request to update.
# @return [Array] True if the status code is 200, false otherwise.
# =end
def get_merge_request_labels(mr_iid)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

  response = get_http(uri).request(request)
  if response.code.to_i == 200
    merge_request = JSON.parse(response.body)
    merge_request['labels']
  else
    []
  end
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

def extract_redmine_links(description)
  description.scan(/https:\/\/#{Regexp.escape(REDMINE_DOMAIN)}\/issues\/(\d+)/).flatten
end

def update_redmine_ticket_status(issue_id, new_status_id)
  uri = URI.parse("https://#{REDMINE_DOMAIN}/issues/#{issue_id}.json")
  request = Net::HTTP::Put.new(uri)
  request.content_type = "application/json"
  request['X-Redmine-API-Key'] = REDMINE_API_KEY
  request.body = JSON.dump({
    "issue" => {
      "status_id" => new_status_id
    }
  })

  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
    http.request(request)
  end

  # Check if the request was successful
  if response.is_a?(Net::HTTPSuccess)
    puts "Issue ##{issue_id} updated successfully."
  else
    puts "Failed to update issue ##{issue_id}. Response: #{response.body}"
  end
end

def leave_comment_on_redmine_ticket(issue_id, comment, is_private = false)
  uri = URI.parse("https://#{REDMINE_DOMAIN}/issues/#{issue_id}.json")
  request = Net::HTTP::Put.new(uri)
  request.content_type = "application/json"
  request['X-Redmine-API-Key'] = REDMINE_API_KEY
  request.body = JSON.dump({
    "issue" => {
      "notes" => comment,
      "private_notes" => is_private
    }
  })

  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
    http.request(request)
  end

  # Handle response
  if response.is_a?(Net::HTTPSuccess)
    puts "Comment added to issue ##{issue_id}."
  else
    puts "Failed to add comment to issue ##{issue_id}. Response: #{response.body}"
  end
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

  mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  mr_numbers.each do |mr_number|
    mr = get_merge_request(mr_number)
    # Redmine
    redmine_links = extract_redmine_links(mr["description"])
    redmine_links.each do |issue_id|
      leave_comment_on_redmine_ticket(issue_id, "fix released in stable version #{GIT_RELEASE_TAG}")
      puts "Commented redmine ##{issue_id} to notify about stable deploy"
      # status_id 3 -> Resolved
      update_redmine_ticket_status(issue_id, 3)
      puts "Updated redmine ##{issue_id} status to 3"
    end
    # Labels
    current_labels = get_merge_request_labels(mr)

    # Replace 'stage::next' with 'stage::stable'
    if current_labels.include?('stage::next')
      current_labels.delete('stage::next')
      update_merge_request_labels(mr, current_labels + ['stage::stable'])
    end
  end

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

  mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten

  mr_numbers.each do |mr_number|
    mr = get_merge_request(mr_number)
    # Redmine
    redmine_links = extract_redmine_links(mr["description"])
    redmine_links.each do |issue_id|
      leave_comment_on_redmine_ticket(issue_id, "fix deployed in next version #{GIT_RELEASE_TAG}")
      puts "Commented redmine ##{issue_id} to notify about canary deploy"
    end
    # Labels
    current_labels = get_merge_request_labels(mr)

    # Replace 'stage::preprod' with 'stage::next'
    if current_labels.include?('stage::preprod')
      current_labels.delete('stage::preprod')
    end

    update_merge_request_labels(mr, current_labels + ['stage::next'])
  end

  # Release
  create_release(changelog)
  puts "Creating release for canary tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

# [preprod] Update labels and changelog
if GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-rc\.\d+\z/
  # TODO: clean, not used by function
  branch = NEXT_BRANCH

  puts "Processing prerelease tag: #{GIT_RELEASE_TAG}"
  # Creates the changelog entry on gitlab
  create_changelog(GIT_RELEASE_TAG, branch)
  # Get the relevant entries to update labels and create release
  changelog = get_changelog(GIT_RELEASE_TAG)

  mr_numbers = changelog.scan(/\[merge request\]\(kchat\/webapp!(\d+)\)/).flatten
  mr_numbers.each do |mr_number|
    mr = get_merge_request(mr_number)
    current_labels = get_merge_request_labels(mr)

    # Labels
    # Add 'stage::preprod' if it doesn't exist
    unless current_labels.include?('stage::preprod')
      update_merge_request_labels(mr, current_labels + ['stage::preprod'])
    end

    # Redmine
    #   redmine_links = extract_redmine_links(mr["description"])
    #   redmine_links.each do |issue_id|
    #     leave_comment_on_redmine_ticket(issue_id, "fix deployed in preprod version #{GIT_RELEASE_TAG}", true)
    #     puts "Commented redmine ##{issue_id} to notify about preprod deploy"
    #   end

  end

  # Release
  create_release(changelog)
  puts "Creating release for preprod tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

# [stable + next + preprod] Notify
if /\A\d+\.\d+\.\d+\z/.match?(GIT_RELEASE_TAG) || GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-next\.\d+\z/ || GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-rc\.\d+\z/
  commit_url = "#{GITLAB_BASE_URL}/kchat/webapp/-/commit/"
  mr_url = "#{GITLAB_BASE_URL}/kchat/webapp/-/merge_requests/"
  formatted_changelog = changelog.gsub(/kchat\/webapp@/, commit_url).gsub(/kchat\/webapp!/, mr_url)
  data = { "text" => formatted_changelog }.to_json
  notify_uri = URI.parse(NOTIFY_CHANNEL)
  notify_request = Net::HTTP::Post.new(notify_uri.request_uri, { "Content-Type" => "application/json" })
  notify_request.body = data

  get_http(notify_uri).request(notify_request)
  puts "Posted changelog to notification channel"
end
