package main

import (
	"encoding/base64"
	"fmt"
	"github.com/jessevdk/go-flags"
	"github.com/russross/blackfriday"
	"io/ioutil"
	"mime"
	"os"
	"path/filepath"
	"regexp"
	"syscall"
)

type Options struct {
	InputFile  string `long:"input" short:"i" description:"input Markdown"`
	OutputFile string `long:"output" short:"o" description:"output HTML"`
	EmbedImage bool   `long:"embed" short:"e" description:"embed image by base64 encoding"`
	TOC        bool   `long:"toc" short:"t" description:"generate TOC"`
	MathJax    bool   `long:"mathjax" short:"m" description:"use MathJax"`
	TableSpan  bool   `long:"span" short:"s" description:"enable table row/col span"`
}

const (
	template = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>%s</title>
%s
</head>
<body>
<div class="container">
<div class="markdown-body">
%s
</div>
</div>
</body>
</html>`

	template_toc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>%s</title>
%s
</head>
<body>
<div class="container">
<div id="markdown-toc"></div>
<div class="markdown-body">
%s
</div>
</div>
</body>
</html>`

	commonHtmlFlags = 0 |
		blackfriday.UseXHTML |
		blackfriday.Smartypants |
		blackfriday.SmartypantsFractions |
		blackfriday.SmartypantsDashes |
		blackfriday.SmartypantsLatexDashes

	extensions = 0 |
		blackfriday.NoIntraEmphasis |
		blackfriday.Tables |
		blackfriday.FencedCode |
		blackfriday.Autolink |
		blackfriday.Strikethrough |
		blackfriday.AutoHeadingIDs |
		blackfriday.HeadingIDs |
		blackfriday.BackslashLineBreak |
		blackfriday.DefinitionLists
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

	var files []string
	for _, input := range inputs {
		f, err := filepath.Glob(input)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		files = append(files, f...)
	}
	if len(files) <= 0 {
		fmt.Fprintln(os.Stderr, "File is not found")
		os.Exit(1)
	}

	if len(opts.OutputFile) > 0 {
		if err := writeHtmlConcat(files, opts.OutputFile, opts.EmbedImage, opts.TOC, opts.MathJax, opts.TableSpan); err != nil {
			fmt.Fprintln(os.Stderr, err)
		}
	} else {
		for _, file := range files {
			if err := writeHtml(file, file+".html", opts.EmbedImage, opts.TOC, opts.MathJax, opts.TableSpan); err != nil {
				fmt.Fprintln(os.Stderr, err)
			}
		}
	}
}

func writeHtml(input, output string, embed, toc, mathjax bool, tablespan bool) error {
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
	if mathjax {
		js += string(mathjax_cfg_bytes[:len(mathjax_cfg_bytes)])
		js += string(mathjax_bytes[:len(mathjax_bytes)])
	}
	if tablespan {
		js += string(tablespan_bytes[:len(tablespan_bytes)])
	}
	css := string(css_bytes[:len(css_bytes)])
	renderer := blackfriday.NewHTMLRenderer(blackfriday.HTMLRendererParameters{
		Flags: commonHtmlFlags,
	})
	opt := []blackfriday.Option{
		blackfriday.WithRenderer(renderer),
		blackfriday.WithExtensions(extensions),
	}
	html := string(blackfriday.Run(md, opt...))

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

	if toc {
		fmt.Fprintf(fo, template_toc, input, js+"\n"+css, html)
	} else {
		fmt.Fprintf(fo, template, input, js+"\n"+css, html)
	}
	return nil
}

func writeHtmlConcat(inputs []string, output string, embed, toc, mathjax bool, tablespan bool) error {
	js := string(js_bytes[:len(js_bytes)])
	if mathjax {
		js += string(mathjax_cfg_bytes[:len(mathjax_cfg_bytes)])
		js += string(mathjax_bytes[:len(mathjax_bytes)])
	}
	if tablespan {
		js += string(tablespan_bytes[:len(tablespan_bytes)])
	}
	css := string(css_bytes[:len(css_bytes)])
	html := ""

	renderer := blackfriday.NewHTMLRenderer(blackfriday.HTMLRendererParameters{
		Flags: commonHtmlFlags,
	})
	opt := []blackfriday.Option{
		blackfriday.WithRenderer(renderer),
		blackfriday.WithExtensions(extensions),
	}
	for _, input := range inputs {
		fi, err := os.Open(input)
		if err != nil {
			return err
		}
		defer fi.Close()

		md, err := ioutil.ReadAll(fi)
		if err != nil {
			return err
		}

		h := string(blackfriday.Run(md, opt...))

		if embed {
			h, err = embedImage(h, filepath.Dir(input))
			if err != nil {
				return err
			}
		}

		html += h
	}

	fo, err := os.Create(output)
	if err != nil {
		return err
	}
	defer fo.Close()

	re := regexp.MustCompile(filepath.Ext(output) + "$")
	title := filepath.Base(re.ReplaceAllString(output, ""))
	if toc {
		fmt.Fprintf(fo, template_toc, title, js+"\n"+css, html)
	} else {
		fmt.Fprintf(fo, template, title, js+"\n"+css, html)
	}
	return nil
}

func embedImage(src, parent string) (string, error) {
	re_find, err := regexp.Compile(`(<img[\S\s]+?src=")([\S\s]+?)("[\S\s]*?/?>)`)
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
		re_replace, err := regexp.Compile(`(<img[\S\s]+?src=")` + regexp.QuoteMeta(img_src) + `("[\S\s]*?/?>)`)
		if err != nil {
			return src, err
		}

		ext := filepath.Ext(img_src)
		mime_type := mime.TypeByExtension(ext)
		if len(mime_type) <= 0 {
			mime_type = "image"
		}
		dest = re_replace.ReplaceAllString(dest, "${1}data:"+mime_type+";base64,"+b64img+"${2}")
	}
	return dest, nil
}
