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

def update_gitlab_issue(project_id, issue_id, description)
  # Call the GitLab API to update the merge request
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues/#{issue_id}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Put.new(uri.path, { 'Private-Token' => GITLAB_API_KEY, 'Content-Type' => 'application/json' })
  request.body = { description: description }.to_json
  http.request(request)
end

def update_gitlab_issue_labels(project_id, issue_id, labels)
  # Call the GitLab API to update the merge request
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues/#{issue_id}")
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

def execute_issue_cpmeta(merge_request, mr_iid)
  # Check if the merge request is attached to an issue
  description = merge_request['description']
  project_id = merge_request['project_id']
  issue_iid = description[/Related to #(\d+)/, 1] || description[/Related to \[#(\d+)\]/, 1]

  if issue_iid
    # Convert issue_iid to integer
    issue_iid = issue_iid.to_i

    # Execute /copy_metadata on related issue to copy trello labels
    uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues/#{issue_iid}/notes")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_KEY })
    request.set_form_data({ 'body' => '/copy_metadata #{mr_iid}' })
    http.request(request)
  end
end

def get_issue_labels(project_id, issue_iid)
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues/#{issue_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_KEY })
  response = http.request(request)
  issue_details = JSON.parse(response.body)
  issue_details['labels']
end

def get_mr_labels(project_id, mr_iid)
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/merge_requests/#{mr_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_KEY })
  response = http.request(request)
  mr_details = JSON.parse(response.body)
  mr_details['labels']
end

def add_issue_label(project_id, issue_iid, labels)
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues/#{issue_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Put.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_KEY })
  request.set_form_data({ 'add_labels' => labels.join(',') }) # Add the new labels without removing the existing ones
  response = http.request(request)
  if response.code.to_i != 200
    puts "Failed to add labels to issue: #{response.body}"
  else
    puts "Successfully added labels #{labels.join(', ')} to issue #{issue_iid}"
  end
end

def remove_issue_label(project_id, issue_iid, labels)
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues/#{issue_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Put.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_KEY })
  request.set_form_data({ 'remove_labels' => labels.join(',') }) # Remove the extra labels without affecting the other ones
  response = http.request(request)
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

def get_all_gitlab_issues(project_id)
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/issues?per_page=1000")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_KEY })
  response = http.request(request)
  issues = JSON.parse(response.body)
end

def create_trello_card(name, description, list_name)
  # Fetch the list ID by its name
  lists = get_board_lists()
  list = lists.find { |list| list['name'] == list_name }

  if list.nil?
    puts "Failed to create Trello card: No list found with name #{list_name}"
    return nil
  end

  list_id = list['id']

  puts list
  puts list_id

  uri = URI.parse("https://api.trello.com/1/cards")
  request = Net::HTTP::Post.new(uri.request_uri, {
    "Content-Type" => "application/x-www-form-urlencoded"
  })
  request.set_form_data({
    "key" => TRELLO_API_KEY,
    "token" => TRELLO_TOKEN,
    "name" => name,
    "desc" => description,
    "idList" => list_id,
  })

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  response = http.request(request)

  if response.code.to_i != 200
    puts "Failed to create Trello card: #{response.body}"
    return nil
  end

  card = JSON.parse(response.body)
  card
end

project_id = 3225
issues = get_all_gitlab_issues(project_id)

# Loop over all issues
issues.each do |issue|
  # Check if issue has 'new-trello' label
  if issue['labels'].include?('new-trello')
    # Create a new Trello card in the 'FEEDBACKS' list with the issue description
    card_response = create_trello_card(issue['title'], issue['description'], 'FEEDBACKS Webapp + Desktop')
    if card_response
      card_id = card_response['id']
      # Get the shortlink of the new Trello card
      card_details = get_trello_card_details(card_id)
      trello_card_link = card_details[:card]['shortUrl']

      # Append the Trello card link to the GitLab issue description
      updated_description = (issue['description'] || '') + "\n\n#### Ticket link\n" + (trello_card_link || '')
      update_gitlab_issue(project_id, issue['iid'], updated_description)

      # Update labels to remove 'new-trello' and add 'trello::FEEDBACKS'
      labels = issue['labels'].reject { |label| label == 'new-trello' } + ['trello::FEEDBACKS Webapp + Desktop']
      update_gitlab_issue_labels(project_id, issue['iid'], labels)

      puts "Created Trello card for issue id #{issue['iid']}. New description: #{updated_description}"
    end
  end
end

# Get a list of merge requests from GitLab API
uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/merge_requests?private_token=#{GITLAB_API_KEY}&per_page=1000")
response = Net::HTTP.get_response(uri)
merge_requests = JSON.parse(response.body)

# Go through each merge request
merge_requests.each do |merge_request|
  description = merge_request['description']
  mr_iid = merge_request['iid']

  sync_issue_metadata(merge_request, project_id, mr_iid)

  # Get merge request details
  uri = URI.parse("https://gitlab.infomaniak.ch/api/v4/projects/#{project_id}/merge_requests/#{mr_iid}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri.path, { 'PRIVATE-TOKEN' => GITLAB_API_KEY })
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

    # Get the list name from the card details
    list_name_from_card = card_details[:list_name]
    # Prepare the new label
    new_label = "trello::#{list_name_from_card}"

    # Check if existing labels match the Trello column
    existing_labels = merge_request['labels']
    existing_trello_label = existing_labels.find { |label| label.start_with?('trello::') }

    if existing_labels.include?('trello-sync')
      # Move the Trello card only if the merge request has a trello-sync label and the Trello list name does not match the existing label
      if existing_trello_label && existing_trello_label != "trello::#{card_details[:list_name]}"
        # Get the list name from the existing label
        list_name_from_label = existing_trello_label.split('::').last

        # Get all lists on the board
        lists = get_board_lists()

        # Find the list with the matching name
        list = lists.find { |list| list['name'] == list_name_from_label }

        if list
          # If a list with the matching name was found, move the card to it
          move_trello_card(card_id, list['id'])
          puts "Moved card #{card_id} to list #{list_name_from_label}"

          # Remove the 'trello-sync' label from the merge request
          existing_labels.delete('trello-sync')
          update_gitlab_merge_request(project_id, mr_iid, existing_labels)
          puts "Removed 'trello-sync' label for merge request id #{mr_iid}. New labels: #{existing_labels.join(', ')}"
        else
          puts "No list found with name: #{list_name_from_label}"
        end
      else
        puts "Trello list matches GitLab label for #{mr_iid} or 'trello-sync' label is not present"
      end
    else
      # Update the labels in GitLab if no Trello label exists or if the Trello list does not match the existing label
      if existing_trello_label != new_label
        # Remove the old Trello label if it exists
        existing_labels.delete(existing_trello_label) if existing_trello_label

        # Add the new label
        existing_labels << new_label

        # Update the labels in GitLab
        update_gitlab_merge_request(project_id, mr_iid, existing_labels)
        puts "Updated labels for merge request id #{mr_iid}. New labels: #{existing_labels.join(', ')}"
      else
        puts "#{mr_iid} Trello list matches GitLab label: #{new_label}"
      end
    end

    execute_issue_cpmeta(mr_details, mr_iid)
  end
end
