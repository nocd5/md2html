package main

import (
	"bufio"
	"fmt"
	"github.com/jessevdk/go-flags"
	"github.com/russross/blackfriday"
	"os"
)

type Options struct {
	InputFile  string `long:"input" short:"i" description:"input Markdown"`
	OutputFile string `long:"output" short:"o" description:"output HTML"`
}

const (
	template = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>%s</title>
%s
</head>
<body>
<div class="markdown-body">%s</div>
</body>
</html>`
	extensions = blackfriday.EXTENSION_NO_INTRA_EMPHASIS |
		blackfriday.EXTENSION_TABLES |
		blackfriday.EXTENSION_FENCED_CODE |
		blackfriday.EXTENSION_AUTOLINK |
		blackfriday.EXTENSION_STRIKETHROUGH |
		blackfriday.EXTENSION_SPACE_HEADERS
)

var opts Options

func main() {
	_, err := flags.Parse(&opts)
	if err != nil {
		os.Exit(1)
	}

	if len(opts.InputFile) <= 0 {
		fmt.Fprintln(os.Stderr, "Please specify input Markdown")
		os.Exit(1)
	}

	fi, err := os.Open(opts.InputFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer fi.Close()

	scanner := bufio.NewScanner(fi)
	md := ""
	for scanner.Scan() {
		md = md + scanner.Text() + "\n"
	}
	js := string(js_bytes[:len(js_bytes)])
	css := string(css_bytes[:len(css_bytes)])
	output := blackfriday.MarkdownCommon([]byte(md))

	output_name := opts.InputFile + ".html"
	if len(opts.OutputFile) > 0 {
		output_name = opts.OutputFile
	}

	fo, err := os.Create(output_name)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer fo.Close()

	fmt.Fprintf(fo, template, opts.InputFile, js+"\n"+css, string(output))
}
