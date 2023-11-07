require 'net/http'
require 'uri'
require 'json'

GITLAB_API_BASE = ENV['CI_API_V4_URL']
GITLAB_PROJECT_ID = ENV['CI_PROJECT_ID']
GITLAB_ACCESS_TOKEN = ENV['GITLAB_API_TOKEN']
GUILD_WEBHOOK_URL = ENV['GUILD_WEBHOOK_URL']

# Function to send a message to kChat
def send_to_kchat(message)
  uri = URI(GUILD_WEBHOOK_URL)
  req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  req.body = { text: message }.to_json
  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
    http.request(req)
  end
  unless res.is_a?(Net::HTTPSuccess)
    raise "HTTP Request to kChat failed: #{res.body}"
  end
end

# Function to get all merge requests with a specific label
def get_merge_requests_with_label(label)
  merge_requests = []
  page = 1
  loop do
    uri = URI("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests")
    params = {
      state: 'opened',
      labels: label,
      per_page: 100,
      page: page
    }
    uri.query = URI.encode_www_form(params)

    req = Net::HTTP::Get.new(uri)
    req['PRIVATE-TOKEN'] = GITLAB_ACCESS_TOKEN

    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(req)
    end

    raise "HTTP Request failed: #{res.body}" unless res.is_a?(Net::HTTPSuccess)

    batch = JSON.parse(res.body)
    break if batch.empty?

    merge_requests.concat(batch)
    page += 1
  end

  merge_requests
end

# Function to parse the context from the description
def parse_context(description)
  description.match(/#### Summary\s+(.+)/)&.captures&.first
end

# Function to check if a merge request has a specific label
def merge_request_has_label?(merge_request, label)
  merge_request['labels'].include?(label)
end

# Function to remove a label from a merge request
def remove_label_from_merge_request(merge_request_iid, current_labels, label)
  uri = URI("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{merge_request_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = (uri.scheme == 'https')

  # Remove the label from the array of existing labels
  updated_labels = (current_labels - [label]).join(',')

  request = Net::HTTP::Put.new(uri.request_uri, 'Content-Type' => 'application/json', 'PRIVATE-TOKEN' => GITLAB_ACCESS_TOKEN)
  request.body = { labels: updated_labels }.to_json

  response = http.request(request)
  unless response.is_a?(Net::HTTPSuccess)
    raise "Failed to remove label from Merge Request IID #{merge_request_iid}: #{response.body}"
  end
end

# Function to parse the staging URL from the comments
def get_staging_url(merge_request_id)
  page = 1
  loop do
    uri = URI("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{merge_request_id}/notes")
    uri.query = URI.encode_www_form({ per_page: 100, page: page })

    req = Net::HTTP::Get.new(uri)
    req['PRIVATE-TOKEN'] = GITLAB_ACCESS_TOKEN

    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(req)
    end

    raise "HTTP Request failed: #{res.body}" unless res.is_a?(Net::HTTPSuccess)

    comments = JSON.parse(res.body)
    break if comments.empty?

    staging_comment = comments.find { |comment| comment['body'] =~ /Staging is now available at/ }
    return staging_comment['body'][/Staging is now available at \{(.+)\}/, 1] if staging_comment

    page += 1
  end
  nil
end

# Main execution flow
begin
  merge_requests = get_merge_requests_with_label('guild-review')

  merge_requests.each do |mr|
    context = parse_context(mr['description'])
    staging_url = merge_request_has_label?(mr, 'staging') ? get_staging_url(mr['iid']) : 'none'

    message = <<-MESSAGE
Projet impacté : kchat
Contexte : #{context || 'N/A'}
Url de test : #{staging_url}
Priorité : Faible
    MESSAGE

    send_to_kchat(message)
    remove_label_from_merge_request(mr['iid'], mr['labels'], 'guild-review')

    # Log the merge request that was sent for review
    puts "Notified kChat about Merge Request: !#{mr['iid']} - #{mr['title']}"
  end
rescue => e
  puts "An error occurred: #{e.message}"
end
