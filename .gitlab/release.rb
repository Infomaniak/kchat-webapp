require 'date'
require_relative 'gitlab'
require_relative 'changelog'
require_relative 'redmine'

MILESTONE = ARGV[1]
NOTIFY_CHANNEL = ARGV[2]
GIT_RELEASE_TAG = ARGV[0]

def process_release(tag)
  changelog, from_commit_sha, to_commit_sha = get_changelog_with_shas(tag)
  dates = get_commit_dates(from_commit_sha, to_commit_sha)

  if dates[0].nil? || dates[1].nil?
    puts "Warning: Could not determine date range for MR fetching"
    return [changelog, []]
  end

  puts "Date range: #{dates[0]} to #{dates[1]}"
  merged_mrs = get_merge_requests_in_range(dates[0], dates[1])

  [changelog, merged_mrs]
end

def process_stable_release(tag, merged_mrs)
  merged_mrs.each do |mr|
    mr_iid = mr["iid"]
    handle_stable_redmine(mr["description"], tag)
    transition_label(mr_iid, 'stage::next', 'stage::stable')
  end
end

def process_next_release(tag, merged_mrs)
  merged_mrs.each do |mr|
    mr_iid = mr["iid"]
    handle_next_redmine(mr["description"], tag)
    remove_labels(mr_iid, ['stage::preprod'])
    add_label_if_missing(mr_iid, 'stage::next')
  end
end

def process_preprod_release(tag, merged_mrs)
  merged_mrs.each do |mr|
    mr_iid = mr["iid"]
    add_label_if_missing(mr_iid, 'stage::preprod')
  end
end

def notify_release(changelog)
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

if /\A\d+\.\d+\.\d+\z/.match?(GIT_RELEASE_TAG)
  puts "Processing full release tag: #{GIT_RELEASE_TAG}"
  changelog, merged_mrs = process_release(GIT_RELEASE_TAG)
  process_stable_release(GIT_RELEASE_TAG, merged_mrs)
  create_release(GIT_RELEASE_TAG, changelog)
  puts "Creating release for tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

if GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-next\.\d+\z/
  puts "Processing prerelease tag: #{GIT_RELEASE_TAG}"
  changelog, merged_mrs = process_release(GIT_RELEASE_TAG)
  process_next_release(GIT_RELEASE_TAG, merged_mrs)
  create_release(GIT_RELEASE_TAG, changelog)
  puts "Creating release for canary tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

if GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-rc\.\d+\z/
  puts "Processing prerelease tag: #{GIT_RELEASE_TAG}"
  changelog, merged_mrs = process_release(GIT_RELEASE_TAG)
  process_preprod_release(GIT_RELEASE_TAG, merged_mrs)
  create_release(GIT_RELEASE_TAG, changelog)
  puts "Creating release for preprod tag #{GIT_RELEASE_TAG} for milestone #{MILESTONE}"
end

if /\A\d+\.\d+\.\d+\z/.match?(GIT_RELEASE_TAG) || GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-next\.\d+\z/ || GIT_RELEASE_TAG =~ /\A\d+\.\d+\.\d+-rc\.\d+\z/
  notify_release(changelog)
end
