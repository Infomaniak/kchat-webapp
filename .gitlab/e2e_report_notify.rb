require 'net/http'
require 'uri'
require 'json'

CI_ACCESS_TOKEN = ENV['GITLAB_API_TOKEN']
CI_API_BASE = ENV['CI_API_V4_URL']
CI_MERGE_REQUEST_IID = ENV['CI_MERGE_REQUEST_IID']
CI_PAGES_PREFIX = ENV['PAGES_PREFIX']
CI_PAGES_URL = ENV['CI_PAGES_URL']
CI_PROJECT_ID = ENV['CI_PROJECT_ID']
WEBHOOK_URL = ENV['NOTIFY_CHANNEL']

# Function to send a message to kChat
def send_to_kchat(msg)
  uri = URI(WEBHOOK_URL)
  req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')

  message = <<-MESSAGE
#{msg}
    MESSAGE
  req.body = { text: message }.to_json
  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
    http.request(req)
  end

  unless res.is_a?(Net::HTTPSuccess)
    raise "HTTP Request to kChat failed: #{res.body}"
  end
end

# Assert if an e2e report note has already been sent by the dev-bot
def has_e2e_report_note()
  uri = URI("#{CI_API_BASE}/projects/#{CI_PROJECT_ID}/merge_requests/#{CI_MERGE_REQUEST_IID}/notes?per_page=1000")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = (uri.scheme == 'https')

  request = Net::HTTP::Get.new(uri.request_uri, 'PRIVATE-TOKEN' => CI_ACCESS_TOKEN)
  response = http.request(request)

  unless response.is_a?(Net::HTTPSuccess)
    raise "Failed to get notes from Merge Request IID #{merge_request_iid}: #{response.body}"
  end

  # Parse the notes
  notes = JSON.parse(response.body)

  # Find the note with the staging URL posted by dev_bot
  report_note = notes.find do |note|
    note['author']['username'] == 'dev_bot' && note['body'].include?("E2E report is now available at")
  end

  # Cast to boolean
  return report_note ? true : false
end

# Notify about the new available pages url
def create_e2e_report_note(message)
  uri = URI.parse("#{CI_API_BASE}/projects/#{CI_PROJECT_ID}/merge_requests/#{CI_MERGE_REQUEST_IID}/notes")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = (uri.scheme == 'https')
    
  request = Net::HTTP::Post.new(uri.path, { 'PRIVATE-TOKEN' => CI_ACCESS_TOKEN })
  request.set_form_data({ 'body' => message })
  
  response = http.request(request)

  unless response.is_a?(Net::HTTPSuccess)
    raise "Failed to create note for Merge Request IID #{CI_MERGE_REQUEST_IID}: #{response.body}"
  end
end

# Main execution flow
if !has_e2e_report_note()
  message = "E2E report is now available at #{CI_PAGES_URL}/#{CI_PAGES_PREFIX}"
  create_e2e_report_note(message)
  send_to_kchat(message)
end
