#!/usr/bin/env ruby

parent = File.expand_path(File.dirname(__FILE__))

js = ''
Dir.glob(parent + '/assets/*.js').each do |f|
  js += '<script type="text/javascript">' + "\n"
  js += File.read(f, encoding: Encoding::UTF_8) + "\n"
  js += '</script>' + "\n"
end
js_bytes = js.unpack('C*')
             .map { |b| format('0x%02X', b) }
             .join(', ')
             .gsub(/(?:0x\w{2},\s*){16}/, "\\0\n")
             .gsub(/\s+\n/, "\n")

css = ''
Dir.glob(parent + '/assets/*.css').each do |f|
  css += '<style type="text/css">' + "\n"
  css += File.read(f, encoding: Encoding::UTF_8) + "\n"
  css += '</style>' + "\n"
end
css_bytes = css.unpack('C*')
               .map { |b| format('0x%02X', b) }
               .join(', ')
               .gsub(/((?:0x\w{2},\s*){16})/, "\\1\n")
               .gsub(/\s+\n/, "\n")

File.open(parent + '/assets.go', 'wb') do |f|
  f.puts "package main

var js_bytes = [...]byte{
	#{js_bytes.gsub(/\n/, "\n\t")},
}
var css_bytes = [...]byte{
	#{css_bytes.gsub(/\n/, "\n\t")},
}"
end
