require 'net/http'
require 'uri'
require 'json'

TRELLO_API_KEY = ENV['TRELLO_API_KEY']
TRELLO_TOKEN = ENV['TRELLO_TOKEN']
TRELLO_BOARD_ID = ENV['TRELLO_BOARD_ID']
GITLAB_API_KEY = ENV['GITLAB_API_KEY']

def get_trello_card_id(url)
  # Extract the card id from the URL
  url.split('/').last
end

def get_trello_card_details(card_id)
  # Call the Trello API to get card details
  uri = URI.parse("https://api.trello.com/1/cards/#{card_id}?key=#{TRELLO_API_KEY}&token=#{TRELLO_TOKEN}")
  response = Net::HTTP.get_response(uri)
  # Check the HTTP response status
  if response.code.to_i >= 400
    raise "HTTP Error: #{response.code} #{response.message}"
  end

  card = JSON.parse(response.body)
  # Call the Trello API to get list details
  uri = URI.parse("https://api.trello.com/1/lists/#{card['idList']}?key=#{TRELLO_API_KEY}&token=#{TRELLO_TOKEN}")
  response = Net::HTTP.get_response(uri)
  list = JSON.parse(response.body)

  # Return card details and list name
  { card: card, list_name: list['name'] }
rescue JSON::ParserError
  raise "Invalid JSON response from Trello API"
end

def move_trello_card(card_id, list_id)
  # Call the Trello API to move the card to the new list
  uri = URI.parse("https://api.trello.com/1/cards/#{card_id}?idList=#{list_id}&key=#{TRELLO_API_KEY}&token=#{TRELLO_TOKEN}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Put.new(uri)
  http.request(request)
end

def update_gitlab_merge_request(project_id, merge_request_id, labels)
  # Call the GitLab API to update the merge request
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/merge_requests/#{merge_request_id}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Put.new(uri.path, { 'Private-Token' => GITLAB_API_KEY, 'Content-Type' => 'application/json' })
  request.body = { labels: labels }.to_json
  http.request(request)
end

def get_board_lists()
  uri = URI.parse("https://api.trello.com/1/boards/#{TRELLO_BOARD_ID}/lists?key=#{TRELLO_API_KEY}&token=#{TRELLO_TOKEN}")
  response = Net::HTTP.get_response(uri)
  JSON.parse(response.body)
end

# Get a list of merge requests from GitLab API
project_id = 3225
uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/merge_requests?private_token=#{GITLAB_API_KEY}")
response = Net::HTTP.get_response(uri)
merge_requests = JSON.parse(response.body)

# Go through each merge request
merge_requests.each do |merge_request|
  description = merge_request['description']
  mr_iid = merge_request['iid']
  project_id = merge_request['project_id']

  # Get merge request details
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/merge_requests/#{mr_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_TOKEN })
  response = http.request(request)
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
        else
          puts "No list found with name: #{list_name_from_label}"
        end
      end
    else
      # If there is no existing Trello label, add the correct one
      labels = existing_labels.append("trello::#{card_details[:list_name]}")
      update_gitlab_merge_request(merge_request['project_id'], merge_request['iid'], labels)
      # Check if the merge request is attached to an issue
      if mr_details['issues'].any?
        # Get the first attached issue's IID
        issue_iid = mr_details['issues'][0]['iid']

        # Execute /copy_metadata on related issue to copy trello labels
        uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues/#{issue_iid}/notes")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        request = Net::HTTP::Post.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_TOKEN })
        request.set_form_data({ 'body' => '/copy_metadata #{mr_iid}' })
        http.request(request)
      end
    end
  end
end
