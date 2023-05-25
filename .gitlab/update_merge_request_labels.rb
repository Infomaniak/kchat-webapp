require 'net/http'
require 'uri'
require 'json'


# --------------
# --- Trello ---

TRELLO_API_KEY = ENV['TRELLO_API_KEY']
TRELLO_TOKEN = ENV['TRELLO_TOKEN']
TRELLO_BOARD_ID = ENV['TRELLO_BOARD_ID']

TRELLO_BASE_URL = "https://api.trello.com/1"
trello_uri = URI.parse(TRELLO_BASE_URL)
TRELLO_HTTP = Net::HTTP.new(trello_uri.host, trello_uri.port)
TRELLO_HTTP.use_ssl = true

TRELLO_HEADERS = {
  'Content-Type' => 'application/json',
  'key' => TRELLO_API_KEY,
  'token' => TRELLO_TOKEN
}

def get_trello_card_id(url)
  # Extract the card id from the URL
  url.split('/').last
end

def get_trello_card_details(card_id)
  # Call the Trello API to get card details
  uri = URI.parse("#{TRELLO_BASE_URL}/cards/#{card_id}")
  request = Net::HTTP::Get.new(uri.request_uri, TRELLO_HEADERS)
  response = TRELLO_HTTP.request(request)
  # Check the HTTP response status
  if response.code.to_i >= 400
    raise "HTTP Error: #{response.code} #{response.message}"
  end

  card = JSON.parse(response.body)
  # Call the Trello API to get list details
  uri = URI.parse("#{TRELLO_BASE_URL}/lists/#{card['idList']}")
  request = Net::HTTP::Get.new(uri.request_uri, TRELLO_HEADERS)
  response = TRELLO_HTTP.request(request)
  list = JSON.parse(response.body)

  # Return card details and list name
  { card: card, list_name: list['name'] }
rescue JSON::ParserError
  raise "Invalid JSON response from Trello API"
end

def move_trello_card(card_id, list_id)
  # Call the Trello API to move the card to the new list
  uri = URI.parse("#{TRELLO_BASE_URL}/cards/#{card_id}?idList=#{list_id}")
  request = Net::HTTP::Put.new(uri.request_uri, TRELLO_HEADERS)
  response = TRELLO_HTTP.request(request)
  http.request(request)
end

def get_board_lists()
  uri = URI.parse("#{TRELLO_BASE_URL}/boards/#{TRELLO_BOARD_ID}/lists")
  request = Net::HTTP::Get.new(uri.request_uri, TRELLO_HEADERS)
  response = TRELLO_HTTP.request(request)
  if response.code.to_i != 200
    puts "Failed to get board lists: #{response.body}"
    return []
  else
    return JSON.parse(response.body)
  end
end

# --------------
# --- Gitlab ---

GITLAB_API_KEY = ENV['GITLAB_API_KEY']
GITLAB_BASE_URL = "https://gitlab.infomaniak.ch/api/v4"
gitlab_uri = URI.parse(GITLAB_BASE_URL)
GITLAB_HTTP = Net::HTTP.new(gitlab_uri.host, gitlab_uri.port)
GITLAB_HTTP.use_ssl = true

GITLAB_HEADERS = {
  'Content-Type' => 'application/json',
  'PRIVATE-TOKEN' => GITLAB_API_KEY
}

def update_gitlab_merge_request_labels(project_id, mr_iid, labels)
  # Call the GitLab API to update the merge request
  uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Put.new(uri.request_uri, GITLAB_HEADERS)
  request.body = { labels: labels }.to_json
  response = GITLAB_HTTP.request(request)
  if response.code.to_i != 200
    puts "Failed to update merge request: #{response.body}"
  else
    puts "Successfully updated merge request #{mr_iid} labels to #{labels.join(', ')}"
  end
end

def execute_issue_cpmeta(merge_request, mr_iid)
  # Check if the merge request is attached to an issue
  description = merge_request['description']
  issue_iid = description[/Related to #(\d+)/, 1] || description[/Related to \[#(\d+)\]/, 1]

  if issue_iid
    # Convert issue_iid to integer
    issue_iid = issue_iid.to_i

    # Execute /copy_metadata on related issue to copy trello labels
    uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/issues/#{issue_iid}/notes")
    request = Net::HTTP::Post.new(uri.request_uri, GITLAB_HEADERS)
    request.set_form_data({ 'body' => '/copy_metadata #{mr_iid}' })
    response = GITLAB_HTTP.request(request)
  end
end

def get_issue_labels(project_id, issue_iid)
  uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/issues/#{issue_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Get.new(uri.request_uri, GITLAB_HEADERS)
  response = GITLAB_HTTP.request(request)
  issue_details = JSON.parse(response.body)
  issue_details['labels']
end

def get_mr_labels(project_id, mr_iid)
  uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/merge_requests/#{mr_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Get.new(uri.request_uri, GITLAB_HEADERS)
  response = GITLAB_HTTP.request(request)
  mr_details = JSON.parse(response.body)
  mr_details['labels']
end

def add_issue_label(project_id, issue_iid, labels)
  uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/issues/#{issue_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Put.new(uri.request_uri, GITLAB_HEADERS)
  request.set_form_data({ 'add_labels' => labels.join(',') }) # Add the new labels without removing the existing ones
  response = GITLAB_HTTP.request(request)
  if response.code.to_i != 200
    puts "Failed to add labels to issue: #{response.body}"
  else
    puts "Successfully added labels #{labels.join(', ')} to issue #{issue_iid}"
  end
end

def remove_issue_label(project_id, issue_iid, labels)
  uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/issues/#{issue_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Put.new(uri.request_uri, GITLAB_HEADERS)
  request.set_form_data({ 'remove_labels' => labels.join(',') }) # Remove the extra labels without affecting the other ones
  response = GITLAB_HTTP.request(request)
  if response.code.to_i != 200
    puts "Failed to remove labels from issue: #{response.body}"
  else
    puts "Successfully removed labels #{labels.join(', ')} from issue #{issue_iid}"
  end
end

def sync_issue_metadata(merge_request, project_id, mr_iid)
  description = merge_request['description']
  issue_iid = description[/Related to #(\d+)/, 1] || description[/Related to \[#(\d+)\]/, 1]

  if issue_iid
    # Convert issue_iid to integer
    issue_iid = issue_iid.to_i
    mr_labels = get_mr_labels(project_id, mr_iid)
    issue_labels = get_issue_labels(project_id, issue_iid)
    
    trello_mr_labels = mr_labels.select { |label| label.start_with?('trello::') }
    trello_issue_labels = issue_labels.select { |label| label.start_with?('trello::') }

    missing_labels = trello_mr_labels - trello_issue_labels
    if missing_labels.any?
      puts "Adding labels #{missing_labels.join(', ')} to issue #{issue_iid} related to merge request #{mr_iid}"
      add_issue_label(project_id, issue_iid, missing_labels)
    end

    extra_labels = trello_issue_labels - trello_mr_labels
    if extra_labels.any?
      puts "Removing labels #{extra_labels.join(', ')} from issue #{issue_iid} related to merge request #{mr_iid}"
      remove_issue_label(project_id, issue_iid, extra_labels)
    end
  end
end

# Get a list of merge requests from GitLab API
project_id = 3225
uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/merge_requests")
request = Net::HTTP::Get.new(uri.request_uri, GITLAB_HEADERS)
response = GITLAB_HTTP.request(request)
merge_requests = JSON.parse(response.body)

# Go through each merge request
merge_requests.each do |merge_request|
  description = merge_request['description']
  mr_iid = merge_request['iid']
  project_id = merge_request['project_id']

  sync_issue_metadata(merge_request, project_id, mr_iid)

  # Get merge request details
  uri = URI.parse("#{GITLAB_BASE_URL}/projects/#{project_id}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Get.new(uri.request_uri, GITLAB_HEADERS)
  response = GITLAB_HTTP.request(request)
  mr_details = JSON.parse(response.body)

  # Remove HTML comments
  description_without_comments = description.gsub(/<!--.*?-->/m, '')
  trello_links = description_without_comments.scan(/https:\/\/trello.com\/c\/[^\s]+/)
  trello_links.each do |link|
    card_id = get_trello_card_id(link)
    begin
      card_details = get_trello_card_details(card_id)
    rescue StandardError => e
      puts "Error getting details for card #{card_id}: #{e.message}"
      next
    end
    
    # Check if existing labels match the Trello column
    existing_labels = merge_request['labels']
    existing_trello_label = existing_labels.find { |label| label.start_with?('trello::') }
    if existing_trello_label
      if existing_trello_label != "trello::#{card_details[:list_name]}"
        # Get the list name from the label
        list_name_from_label = existing_trello_label.split('::').last
        # Get all lists on the board
        lists = get_board_lists()
        # Find the list with the matching name
        list = lists.find { |list| list['name'] == list_name_from_label }
        if list
          # If a list with the matching name was found, move the card to it
          move_trello_card(card_id, list['id'])
          execute_issue_cpmeta(mr_details, mr_iid)
        else
          puts "No list found with name: #{list_name_from_label}"
        end
      end
    else
      # If there is no existing Trello label, add the correct one
      labels = existing_labels.append("trello::#{card_details[:list_name]}")
      update_gitlab_merge_request_labels(merge_request['project_id'], merge_request['iid'], labels)
      execute_issue_cpmeta(mr_details, mr_iid)
    end
  end
end
