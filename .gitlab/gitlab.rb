require 'json'
require 'net/http'
require 'openssl'

GITLAB_BASE_URL = ENV['GITLAB_BASE_URL']
GITLAB_API_BASE = "#{GITLAB_BASE_URL}/api/v4"
GITLAB_PROJECT_ID = ENV['CI_PROJECT_ID']
GITLAB_ACCESS_TOKEN = ENV['GITLAB_API_TOKEN']

def get_http(uri)
  Net::HTTP.new(uri.host, uri.port).tap do |http|
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
  end
end

def get_commit_sha(tag)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/tags/#{tag}")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

  response = get_http(uri).request(request)

  if response.code.to_i == 200
    JSON.parse(response.body)["commit"]["id"]
  else
    raise "Failed to fetch the commit SHA for tag #{tag}"
  end
end

def get_all_tags
  page = 1
  all_tags = []

  loop do
    uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/tags?page=#{page}&per_page=100")
    request = Net::HTTP::Get.new(uri.request_uri)
    request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

    response = get_http(uri).request(request)

    if response.code.to_i == 200
      tags = JSON.parse(response.body)
      break if tags.empty?

      all_tags.concat(tags)
      page += 1
    else
      raise "Failed to fetch the tags (page #{page})"
    end
  end

  all_tags
end

def get_merge_request(mr_iid)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  response = get_http(uri).request(request)

  if response.code.to_i >= 400
    raise "HTTP Error: #{response.code} #{response.message}"
  end

  JSON.parse(response.body)
rescue JSON::ParserError
  raise "Invalid JSON response from GitLab API"
end

def get_merge_request_labels(mr_iid)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Get.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

  response = get_http(uri).request(request)
  if response.code.to_i == 200
    merge_request = JSON.parse(response.body)
    merge_request['labels']
  else
    []
  end
end

def update_merge_request_labels(mr_iid, labels)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests/#{mr_iid}")
  request = Net::HTTP::Put.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data("labels" => labels.join(","))

  response = get_http(uri).request(request)
  response.code.to_i == 200
end

def create_release(tag, description)
  uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/releases")
  request = Net::HTTP::Post.new(uri.request_uri)
  request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN
  request.set_form_data({
    "name" => tag,
    "tag_name" => tag,
    "description" => description
  })

  response = get_http(uri).request(request)
  response.code.to_i == 201
end

def get_merge_requests_in_range(from_date, to_date)
  puts "Fetching merge requests between #{from_date} and #{to_date}"

  all_mrs = []
  page = 1

  loop do
    uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/merge_requests?state=merged&target_branch=master&page=#{page}&per_page=100")
    request = Net::HTTP::Get.new(uri.request_uri)
    request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

    response = get_http(uri).request(request)

    if response.code.to_i == 200
      mrs = JSON.parse(response.body)
      break if mrs.empty?

      all_mrs.concat(mrs)
      page += 1

      break if page > 20
    else
      puts "Failed to fetch MRs: #{response.code} #{response.message}"
      return []
    end
  end

  from_datetime = DateTime.parse(from_date)
  to_datetime = DateTime.parse(to_date)

  merged_mrs = all_mrs.select do |mr|
    merge_date = mr["merged_at"]
    next false if merge_date.nil?

    merge_datetime = DateTime.parse(merge_date)
    merge_datetime >= from_datetime && merge_datetime <= to_datetime
  end

  puts "Found #{merged_mrs.length} MRs merged in range"
  merged_mrs
end

def get_commit_dates(from_sha, to_sha)
  dates = []

  [from_sha, to_sha].each_with_index do |sha, index|
    uri = URI.parse("#{GITLAB_API_BASE}/projects/#{GITLAB_PROJECT_ID}/repository/commits/#{sha}")
    request = Net::HTTP::Get.new(uri.request_uri)
    request["PRIVATE-TOKEN"] = GITLAB_ACCESS_TOKEN

    response = get_http(uri).request(request)

    if response.code.to_i == 200
      commit_data = JSON.parse(response.body)
      dates << commit_data["committed_date"]
    else
      dates << nil
    end
  end

  dates
end

def transition_label(mr_iid, from_label, to_label)
  current_labels = get_merge_request_labels(mr_iid)

  if current_labels.include?(from_label)
    current_labels.delete(from_label)
    update_merge_request_labels(mr_iid, current_labels + [to_label])
  end
end

def add_label_if_missing(mr_iid, label)
  current_labels = get_merge_request_labels(mr_iid)

  unless current_labels.include?(label)
    update_merge_request_labels(mr_iid, current_labels + [label])
  end
end

def remove_labels(mr_iid, labels_to_remove)
  current_labels = get_merge_request_labels(mr_iid)
  new_labels = current_labels - labels_to_remove
  update_merge_request_labels(mr_iid, new_labels)
end
