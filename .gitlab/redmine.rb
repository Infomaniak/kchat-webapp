require 'json'
require 'net/http'

REDMINE_DOMAIN = ENV['REDMINE_DOMAIN']
REDMINE_API_KEY = ENV['REDMINE_API_KEY']

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

  if response.is_a?(Net::HTTPSuccess)
    puts "Comment added to issue ##{issue_id}."
  else
    puts "Failed to add comment to issue ##{issue_id}. Response: #{response.body}"
  end
end

def handle_stable_redmine(mr_description, version)
  redmine_links = extract_redmine_links(mr_description)
  redmine_links.each do |issue_id|
    leave_comment_on_redmine_ticket(issue_id, "fix released in stable version #{version}")
    puts "Commented redmine ##{issue_id} to notify about stable deploy"
    update_redmine_ticket_status(issue_id, 3)
    puts "Updated redmine ##{issue_id} status to 3"
  end
end

def handle_next_redmine(mr_description, version)
  redmine_links = extract_redmine_links(mr_description)
  redmine_links.each do |issue_id|
    leave_comment_on_redmine_ticket(issue_id, "fix deployed in next version #{version}")
    puts "Commented redmine ##{issue_id} to notify about canary deploy"
  end
end
