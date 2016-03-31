#!/usr/bin/env ruby
parent = File.expand_path(File.dirname(__FILE__))

js = ""
Dir::glob(parent + '/assets/*.js').each { |f|
    js += '<script type="text/javascript">' + "\n"
    js += File.read(f, :encoding => Encoding::UTF_8) + "\n"
    js += '</script>' + "\n"
}
js_bytes = js.unpack('C*').join(', ')

css = ""
Dir::glob(parent + '/assets/*.css').each { |f|
    css += '<style type="text/css">' + "\n"
    css += File.read(f, :encoding => Encoding::UTF_8) + "\n"
    css += '</style>'  + "\n"
}
css_bytes = css.unpack('C*').join(', ')

File.open(parent + '/assets.go', "wb") { |f|
    f.puts "package main\n\nvar js_bytes = [...]byte{#{js_bytes}}\nvar css_bytes = [...]byte{#{css_bytes}}"
}
