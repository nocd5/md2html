package main

import (
	"encoding/base64"
	"fmt"
	"github.com/jessevdk/go-flags"
	"github.com/russross/blackfriday"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"syscall"
)

type Options struct {
	InputFile  string `long:"input" short:"i" description:"input Markdown"`
	OutputFile string `long:"output" short:"o" description:"output HTML"`
	EmbedImage bool   `long:"embed" short:"e" description:"embed image by base64 encoding"`
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

func main() {
	var opts Options
	inputs, err := flags.Parse(&opts)
	if err != nil {
		os.Exit(1)
	}

	if len(opts.InputFile) > 0 {
		inputs = []string{opts.InputFile}
	}

	if len(inputs) <= 0 {
		fmt.Fprintln(os.Stderr, "Please specify input Markdown")
		os.Exit(1)
	}

	for _, input := range inputs {
		files, err := filepath.Glob(input)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		if len(files) <= 0 {
			fmt.Fprintln(os.Stderr, "File is not found")
			os.Exit(1)
		}

		for _, file := range files {
			output := file + ".html"
			if len(opts.OutputFile) > 0 {
				output = opts.OutputFile
			}

			if err := writeHtml(file, output, opts.EmbedImage); err != nil {
				fmt.Fprintln(os.Stderr, err)
			}
		}
	}
}

func writeHtml(input, output string, embed bool) error {
	fi, err := os.Open(input)
	if err != nil {
		return err
	}
	defer fi.Close()

	md, err := ioutil.ReadAll(fi)
	if err != nil {
		return err
	}

	js := string(js_bytes[:len(js_bytes)])
	css := string(css_bytes[:len(css_bytes)])
	html := string(blackfriday.MarkdownCommon(md))

	if embed {
		html, err = embedImage(html, filepath.Dir(input))
		if err != nil {
			return err
		}
	}

	fo, err := os.Create(output)
	if err != nil {
		return err
	}
	defer fo.Close()

	fmt.Fprintf(fo, template, input, js+"\n"+css, html)
	return nil
}

func embedImage(src, parent string) (string, error) {
	re_find, err := regexp.Compile(`(<img[\S\s]+?src=")([\S\s]+?)("[\S\s]+?/>)`)
	if err != nil {
		return src, err
	}
	img_tags := re_find.FindAllString(src, -1)

	dest := src
	for _, t := range img_tags {
		img_src := re_find.ReplaceAllString(t, "$2")
		img_path := img_src
		if !filepath.IsAbs(img_src) {
			img_path = filepath.Join(parent, img_src)
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
				continue
			}
		}

		datatype := "imgae"
		ext := filepath.Ext(img_src)
		if len(ext) > 0 {
			datatype = "image/" + ext[1:]
		}

		f, err := os.Open(img_path)
		if err != nil {
			pathErr := err.(*os.PathError)
			errno := pathErr.Err.(syscall.Errno)
			if errno != 0x7B { // suppress ERROR_INVALID_NAME
				fmt.Fprintln(os.Stderr, err)
			}
			continue
		}
		defer f.Close()

		d, err := ioutil.ReadAll(f)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			continue
		}

		b64img := base64.StdEncoding.EncodeToString(d)
		re_replace, err := regexp.Compile(`(<img[\S\s]+?src=")` + regexp.QuoteMeta(img_src) + `("[\S\s]+?/>)`)
		if err != nil {
			return src, err
		}
		dest = re_replace.ReplaceAllString(dest, "${1}data:"+datatype+";base64,"+b64img+"${2}")
	}
	return dest, nil
}
