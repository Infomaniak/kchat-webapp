require 'net/http'
require 'uri'
require 'json'

CI_API_BASE = ENV['CI_API_V4_URL']
CI_PROJECT_ID = ENV['CI_PROJECT_ID']
CI_ACCESS_TOKEN = ENV['GITLAB_API_TOKEN']
CI_MERGE_REQUEST_IID = ENV['CI_MERGE_REQUEST_IID']

# Function to parse the staging URL from the comments
def get_staging_url()
  uri = URI("#{CI_API_BASE}/projects/#{CI_PROJECT_ID}/merge_requests/#{CI_MERGE_REQUEST_IID}/notes?per_page=1000")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = (uri.scheme == 'https')

  request = Net::HTTP::Get.new(uri.request_uri, 'PRIVATE-TOKEN' => CI_ACCESS_TOKEN)
  response = http.request(request)

  unless response.is_a?(Net::HTTPSuccess)
    raise "Failed to get notes from Merge Request IID #{CI_MERGE_REQUEST_IID}: #{response.body}"
  end

  # Parse the notes
  notes = JSON.parse(response.body)

  # Find the note with the staging URL posted by dev_bot
  staging_note = notes.find do |note|
    note['author']['username'] == 'dev_bot' && note['body'].include?("Staging is now available at")
  end

  # Extract the URL if the note is found, or return 'none'
  if staging_note
    match = staging_note['body'].match(/Staging is now available at (\S+)/)
    match[1] if match
  else
    'none'
  end
end

# Main execution flow
puts get_staging_url()
