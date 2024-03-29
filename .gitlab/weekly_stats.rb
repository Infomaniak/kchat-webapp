require 'net/http'
require 'uri'
require 'json'
require 'date'

GITLAB_API_TOKEN = ENV['GITLAB_API_TOKEN']
GITLAB_PROJECT_ID = 3225
GITLAB_API_URL = "https://gitlab.infomaniak.ch/api/v4"
NOTIFY_CHANNEL = ARGV[0]

def get_this_weeks_merge_requests
  uri = URI("#{GITLAB_API_URL}/projects/#{GITLAB_PROJECT_ID}/merge_requests?updated_after=#{(Time.now - 60 * 60 * 24 * 7).utc.strftime('%Y-%m-%dT%H:%M:%SZ')}")
  # puts uri
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri, { "PRIVATE-TOKEN" => GITLAB_API_TOKEN })
  response = http.request(request)
  JSON.parse(response.body)
end

def get_merge_request_notes(mr_iid)
  uri = URI("#{GITLAB_API_URL}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}/notes")
  response = Net::HTTP.get(uri)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri, { "PRIVATE-TOKEN" => GITLAB_API_TOKEN })
  response = http.request(request)
  JSON.parse(response.body)
end

def convert_time_to_seconds(time_string)
  time_string = time_string.downcase
  seconds = 0
  if time_string =~ /(\d+)w/
    seconds += $1.to_i * 604800  # 1 week = 7 days * 24 hours * 60 minutes * 60 seconds
  end
  if time_string =~ /(\d+)d/
    seconds += $1.to_i * 86400   # 1 day = 24 hours * 60 minutes * 60 seconds
  end
  if time_string =~ /(\d+)h/
    seconds += $1.to_i * 3600    # 1 hour = 60 minutes * 60 seconds
  end
  if time_string =~ /(\d+)m/
    seconds += $1.to_i * 60      # 1 minute = 60 seconds
  end
  if time_string =~ /(\d+)s/
    seconds += $1.to_i
  end
  seconds
end

def parse_time_spent(note)
  add_regex = /added (.*) of time spent(?: at (.*))?/i
  subtract_regex = /subtracted (.*) of time spent(?: at (.*))?/i
  remove_regex = /Removed time spent/i

  add_match = add_regex.match(note)
  if add_match
    # puts convert_time_to_seconds(add_match[1])
    return convert_time_to_seconds(add_match[1]), add_match[2]
  end

  subtract_match = subtract_regex.match(note)
  if subtract_match
    return -convert_time_to_seconds(subtract_match[1]), subtract_match[2]
  end

  if remove_regex.match(note)
    return 0, nil
  end

  return nil, nil
end

def get_gitlab_issues
  uri = URI("#{GITLAB_API_URL}/projects/#{GITLAB_PROJECT_ID}/issues?updated_after=#{(Time.now - 60 * 60 * 24 * 7).utc.strftime('%Y-%m-%dT%H:%M:%SZ')}")
  # puts uri
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

def get_merge_request_activity(project_id, merge_request_iid)
  uri = URI.parse("#{GITLAB_API_URL}/projects/#{project_id}/merge_requests/#{merge_request_iid}/resource_state_events")
  request = Net::HTTP::Get.new(uri, { "PRIVATE-TOKEN" => GITLAB_API_TOKEN })
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  response = http.request(request)

  if response.code.to_i != 200
    puts "Failed to get merge request activity: #{response.body}"
    return []
  else
    return JSON.parse(response.body)
  end
end

def seconds_to_human_readable(total_seconds)
  units = {
    "w" => 7*24*60*60,
    "d" => 24*60*60,
    "h" => 60*60,
    "m" => 60,
  }

  result = []
  units.each do |unit, seconds|
    if total_seconds >= seconds
      amount = (total_seconds/seconds).floor
      total_seconds -= amount * seconds
      result << "#{amount}#{unit}" if amount > 0
    end
  end

  return result.join(' ')
end

def extract_trello_link(description)
  return nil if description.nil?

  # This regex will capture Trello URLs
  trello_regex = /(https:\/\/trello.com\/c\/[a-zA-Z0-9]+)/

  description.match(trello_regex)&.captures&.first
end

def print_weekly_summary(weekly_summary)
  output = []

  # output << "#### Weekly:\n\n"
  # output << "\n"
  # output << "| Merge Req | Trello | Time Spent | User |"
  # output << "|---|---|---|---|"
  # weekly_summary['working_on'].each do |id, mr|
  #   trello_link = extract_trello_link(mr['description'])
  #   trello_text = trello_link ? "[Trello](#{trello_link})" : ""
  #   output << "| [#{mr['title']}](#{mr['web_url']}) | #{trello_text} | #{mr['time_spent']} | @#{mr['user']} |"
  # end

  if weekly_summary['issues'].any?
    output << "\n #### **Issues À Discuter**"
    output << "\n"
    output << "| &nbsp; | Link | Assignees |"
    output << "|---|---|---|"
    weekly_summary['issues'].each do |id, issue|
      trello_link = extract_trello_link(issue['description'])
      trello_text = trello_link ? "[Trello](#{trello_link})" : ""
      assignees = issue['assignees'].empty? ? "unassigned" : "@#{issue['assignees'].join(", @")}"
      output << "| [#{issue['title']}](#{issue['web_url']}) | #{trello_text} | #{assignees} |"
    end
  end

  if weekly_summary['stagings'].any?
    output << "\n #### **Stagings:**"
    output << "\n"
    output << "| &nbsp; | Trello | User |"
    output << "|---|---|---|---|"
    weekly_summary['stagings'].each do |mr|
      trello_link = extract_trello_link(mr['description'])
      trello_text = trello_link ? "[Trello](#{trello_link})" : ""
      output << "| [#{mr['title']}](#{mr['web_url']}) | #{trello_text} | @#{mr['user']} |"
    end
  end

  if weekly_summary['canary_releases'].any?
    output << "\n #### **Canary:**"
    output << "\n"
    output << "| &nbsp; | Link | User |"
    output << "|---|---|---|"
    weekly_summary['canary_releases'].each do |mr|
      trello_link = extract_trello_link(mr['description'])
      trello_text = trello_link ? "[Trello](#{trello_link})" : ""
      output << "| [#{mr['title']}](#{mr['web_url']}) | #{trello_text} | @#{mr['user']} |"
    end
  end

  if weekly_summary['prod_releases'].any?
    output << "\n #### **Prod releases this week:**"
    output << "\n"
    output << "| &nbsp; | Link | User |"
    output << "|---|---|---|"
    weekly_summary['prod_releases'].each do |mr|
      trello_link = extract_trello_link(mr['description'])
      trello_text = trello_link ? "[Trello](#{trello_link})" : ""
      output << "| [#{mr['title']}](#{mr['web_url']}) | #{trello_text} | @#{mr['user']} |"
    end
  end

  output << "\n"

  output.join("\n")
end

def main
  merge_requests = get_this_weeks_merge_requests
  weekly_summary = {
    'working_on' => {},
    'issues' => {},
    'stagings' => [],
    'prod_releases' => [],
    'canary_releases' => []
  }

  merge_requests.each do |mr|
    total_time_spent = 0
    notes = get_merge_request_notes(mr['iid'])
    notes.each do |note|
      time_spent, _ = parse_time_spent(note['body'])
      # puts time_spent
      total_time_spent += time_spent if time_spent
    end

    if mr['labels'].include?('stage::prod')
      weekly_summary['prod_releases'] << {
        'title' => mr['title'],
        'description' => mr['description'],
        'web_url' => mr['web_url'],
        'link' => "#{GITLAB_API_URL}/#{GITLAB_PROJECT_ID}/merge_requests/#{mr['iid']}",
        'user' => mr['author']['username']
      }
    end

    if mr['labels'].include?('stage::next')
      weekly_summary['canary_releases'] << {
        'title' => mr['title'],
        'description' => mr['description'],
        'web_url' => mr['web_url'],
        'link' => "#{GITLAB_API_URL}/#{GITLAB_PROJECT_ID}/merge_requests/#{mr['iid']}",
        'user' => mr['author']['username']
      }
    end

    if mr['labels'].include?('staging')
      # next if total_time_spent == 0
      # human_readable_time_spent = seconds_to_human_readable(total_time_spent)
      weekly_summary['stagings'] << {
        'title' => mr['title'],
        'description' => mr['description'],
        'web_url' => mr['web_url'],
        'link' => "#{GITLAB_API_URL}/#{GITLAB_PROJECT_ID}/merge_requests/#{mr['iid']}",
        # 'time_spent' => human_readable_time_spent,
        'user' => mr['author']['username']
      }
    end

    # Skip to the next merge request if no time was spent
    # next if total_time_spent == 0
    # human_readable_time_spent = seconds_to_human_readable(total_time_spent)
    # weekly_summary['working_on'][mr['iid']] = {
    #   'title' => mr['title'],
    #   'description' => mr['description'],
    #   'web_url' => mr['web_url'],
    #   'link' => "#{GITLAB_API_URL}/#{GITLAB_PROJECT_ID}/merge_requests/#{mr['iid']}",
    #   'time_spent' => human_readable_time_spent,
    #   'user' => mr['author']['username']
    # }
  end

  issues = get_gitlab_issues
  important_issues = issues.select { |issue| issue['labels'].include?("cp~") }

  if important_issues.any?
    important_issues.each do |issue|
      weekly_summary['issues'][issue['iid']] = {
        'title' => issue['title'],
        'description' => issue['description'],
        'web_url' => issue['web_url'],
        'link' => "#{GITLAB_API_URL}/#{GITLAB_PROJECT_ID}/issues/#{issue['iid']}",
        'assignees' => issue['assignees'].map { |a| a['username'] }
      }
      if issue['assignees'].any?
        assignee_usernames = issue['assignees'].map { |assignee| assignee['username'] }
      end
    end
  end

  message = print_weekly_summary(weekly_summary)
  # puts message
  notify_channel(message)
end

main
