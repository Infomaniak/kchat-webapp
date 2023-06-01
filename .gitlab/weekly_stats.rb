require 'net/http'
require 'uri'
require 'json'

GITLAB_API_TOKEN = ENV['GITLAB_API_KEY']
GITLAB_PROJECT_ID = 3225
GITLAB_API_URL = "https://gitlab.infomaniak.ch/api/v4"
NOTIFY_CHANNEL = ARGV[0]

def get_gitlab_merge_requests
  uri = URI("#{GITLAB_API_URL}/projects/#{GITLAB_PROJECT_ID}/merge_requests")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri, { "PRIVATE-TOKEN" => GITLAB_API_TOKEN })
  response = http.request(request)
  JSON.parse(response.body)
end

def get_gitlab_issues
  uri = URI("#{GITLAB_API_URL}/projects/#{GITLAB_PROJECT_ID}/issues")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri, { "PRIVATE-TOKEN" => GITLAB_API_TOKEN })
  response = http.request(request)
  JSON.parse(response.body)
end

def notify_channel(message)
  uri = URI(NOTIFY_CHANNEL)
  request = Net::HTTP::Post.new(uri, { "Content-Type" => "application/json" })
  request.body = { "text" => message }.to_json
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.request(request)
end

def main
  merge_requests = get_gitlab_merge_requests
  message = "#### Weekly summary:\n**Working on:**\n"

  merge_requests.each do |mr|
    if mr['time_stats']['total_time_spent'] > 0
      message += "- [#{mr['title']}]({mr['web_url']}) #{mr['time_stats']['human_total_time_spent']} @#{mr['author']['username']}\n"
    end
  end

  issues = get_gitlab_issues
  important_issues = issues.select { |issue| issue['labels'].include?("❗️") }

  if important_issues.any?
    message += "\n❗️ Blockers (see issue discussion or trello)\n"
    important_issues.each do |issue|
      message += "- [#{issue['title']}]({issue['web_url']})"
      if issue['assignees'].any?
        assignee_usernames = issue['assignees'].map { |assignee| assignee['username'] }
        message += " (assigned to @#{assignee_usernames.join(', @')})"
      end
      message += "\n"
    end
  end

  notify_channel(message)
end

main
