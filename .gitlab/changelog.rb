require_relative 'gitlab'

def valid_version?(version)
  version =~ /\A\d+\.\d+\.\d+(-next\.\d+|-rc\.\d+)?\z/
end

def parse_version(version)
  pre_release_delimiter = version.include?('-rc.') ? '-rc.' : '-next.'
  main, pre_release = version.split(pre_release_delimiter)
  parts = main.split('.').map(&:to_i)

  pre_release_part = pre_release ? pre_release.to_i : -1
  parts << pre_release_part
  parts
end

def compare_versions(v1, v2)
  length = [v1.length, v2.length].max
  (0...length).each do |i|
    a = v1[i] || 0
    b = v2[i] || 0
    return a <=> b if a != b
  end
  0
end

def get_last_tag(current_tag)
  is_pre_release = current_tag.include?('-next.') || current_tag.include?('-rc.')
  all_tags = get_all_tags.select { |tag| valid_version?(tag["name"]) }

  current_tag_parts = parse_version(current_tag)
  previous_tags = all_tags.select do |tag|
    is_tag_pre_release = tag["name"].include?('-next.') || tag["name"].include?('-rc.')
    next false if is_pre_release != is_tag_pre_release
    compare_versions(parse_version(tag["name"]), current_tag_parts) < 0
  end

  if previous_tags.empty?
    raise "No previous tags found that meet the criteria."
  else
    previous_tags.max_by { |tag| parse_version(tag["name"]) }["name"]
  end
end

def get_changelog(tag)
  puts "Generating changelog for tag #{tag}"
  last_tag = get_last_tag(tag)
  puts "Last tag: #{last_tag}"
  from_commit_sha = get_commit_sha(last_tag)
  to_commit_sha = get_commit_sha(tag)

  config_path = File.join(__dir__, '..', 'cliff.toml')
  cmd = "git-cliff --config #{config_path} #{from_commit_sha}..#{to_commit_sha}"
  puts "Running: #{cmd}"

  output = `#{cmd}`

  if $?&.exitstatus != 0
    raise "Error generating changelog: #{output}"
  end

  output.strip.empty? ? "No changes found" : output.strip
rescue StandardError => e
  raise "Error generating changelog: #{e.message}"
end

def get_changelog_with_shas(tag)
  last_tag = get_last_tag(tag)
  from_commit_sha = get_commit_sha(last_tag)
  to_commit_sha = get_commit_sha(tag)
  changelog = get_changelog(tag)

  [changelog, from_commit_sha, to_commit_sha]
end
