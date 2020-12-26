package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	chromahtml "github.com/alecthomas/chroma/formatters/html"
	"github.com/jessevdk/go-flags"
	"github.com/nocd5/goldmark-highlighting"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer"
	"github.com/yuin/goldmark/renderer/html"
	"io/ioutil"
	"mime"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"syscall"
)

type Options struct {
	InputFile  string `long:"input" short:"i" description:"input Markdown"`
	OutputFile string `long:"output" short:"o" description:"output HTML"`
	EmbedImage bool   `long:"embed" short:"e" description:"embed image by base64 encoding"`
	TOC        bool   `long:"toc" short:"t" description:"generate TOC"`
	MathJax    bool   `long:"mathjax" short:"m" description:"use MathJax"`
	Favicon    string `long:"favicon" short:"f" description:"use favicon"`
	TableSpan  bool   `long:"span" short:"s" description:"enable table row/col span"`
	CustomCSS  string `long:"css" short:"c" description:"add custom CSS"`
}

const (
	template = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
%s<title>%s</title>
%s
</head>
<body>
<div class="container">
%s<div class="markdown-body">
%s
</div>
</div>
</body>
</html>`

	toc_tag = `<div id="markdown-toc"></div>
`
	favicon_tag = `<link rel='shortcut icon' href='data:image/x-icon;base64,%s'/>
`
)

// goldmark convert options
var (
	extensions = []goldmark.Extender{
		extension.GFM,
		extension.DefinitionList,
		extension.Footnote,
		extension.Typographer,
		highlighting.NewHighlighting(
			highlighting.WithStyle("github"),
			highlighting.WithFormatOptions(
				chromahtml.WithClasses(true),
			),
		),
	}
	parseroptions = []parser.Option{
		parser.WithAutoHeadingID(),
	}
	rendereroptions = []renderer.Option{
		html.WithXHTML(),
		html.WithUnsafe(),
	}
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

	parser := goldmark.New(
		goldmark.WithExtensions(extensions...),
		goldmark.WithParserOptions(parseroptions...),
		goldmark.WithRendererOptions(rendereroptions...),
	)

	if len(opts.OutputFile) > 0 {
		re := regexp.MustCompile(filepath.Ext(opts.OutputFile) + "$")
		title := filepath.Base(re.ReplaceAllString(opts.OutputFile, ""))
		html, err := renderHtmlConcat(files, opts.EmbedImage, parser)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		if err := writeHtml(html, title, opts.OutputFile, opts.TOC, opts.MathJax, opts.Favicon, opts.TableSpan, opts.CustomCSS); err != nil {
			fmt.Fprintln(os.Stderr, err)
		}
	} else {
		for _, file := range files {
			html, err := renderHtml(file, opts.EmbedImage, parser)
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
				os.Exit(1)
			}
			if err := writeHtml(html, file, file+".html", opts.TOC, opts.MathJax, opts.Favicon, opts.TableSpan, opts.CustomCSS); err != nil {
				fmt.Fprintln(os.Stderr, err)
			}
		}
	}
}

func renderHtml(input string, embed bool, parser goldmark.Markdown) (string, error) {
	fi, err := os.Open(input)
	if err != nil {
		return "", err
	}
	defer fi.Close()

	md, err := ioutil.ReadAll(fi)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := parser.Convert(md, &buf); err != nil {
		return "", err
	}

	html, err := parseImageOpt(buf.String())
	if err != nil {
		return "", err
	}

	if embed {
		html, err = embedImage(html, filepath.Dir(input))
		if err != nil {
			return "", err
		}
	}

	return html, nil
}

func renderHtmlConcat(inputs []string, embed bool, parser goldmark.Markdown) (string, error) {
	html := ""
	for _, input := range inputs {
		fi, err := os.Open(input)
		if err != nil {
			return "", err
		}
		defer fi.Close()

		md, err := ioutil.ReadAll(fi)
		if err != nil {
			return "", err
		}

		var buf bytes.Buffer
		if err := parser.Convert(md, &buf); err != nil {
			return "", err
		}

		h, err := parseImageOpt(buf.String())
		if err != nil {
			return "", err
		}

		if embed {
			h, err = embedImage(h, filepath.Dir(input))
			if err != nil {
				return "", err
			}
		}

		html += h
	}

	return html, nil
}

func writeHtml(html, title, output string, toc, mathjax bool, favicon string, tablespan bool, customcss string) error {
	var err error

	js := string(js_bytes[:len(js_bytes)])
	if mathjax {
		js += string(mathjax_cfg_bytes[:len(mathjax_cfg_bytes)])
		js += string(mathjax_bytes[:len(mathjax_bytes)])
	}

	css := string(css_bytes[:len(css_bytes)])

	tt := ""
	if toc {
		tt = toc_tag
	}

	favi := ""
	if len(favicon) > 0 {
		cwd, _ := os.Getwd()
		b, err := decodeBase64(favicon, cwd)
		if err != nil {
			return err
		}
		favi = fmt.Sprintf(favicon_tag, b)
	}

	if mathjax {
		html, err = replaceMathJaxCodeBlock(html)
		if err != nil {
			return err
		}
	}

	html, err = replaceCheckBox(html)
	if err != nil {
		return err
	}

	if tablespan {
		html, err = replaceTableSpan(html)
		if err != nil {
			return err
		}
	}

	if len(customcss) > 0 {
		fi, err := os.Open(customcss)
		if err != nil {
			return err
		}
		defer fi.Close()

		c, err := ioutil.ReadAll(fi)
		if err != nil {
			return err
		}
		css += "<style type=\"text/css\">\n" + string(c) + "</style>\n"
	}

	fo, err := os.Create(output)
	if err != nil {
		return err
	}
	defer fo.Close()

	fmt.Fprintf(fo, template, favi, title, js+"\n"+css, tt, html)
	return nil
}

func embedImage(src, parent string) (string, error) {
	dest := src

	re_find := regexp.MustCompile(`(<img[\S\s]+?src=")([\S\s]+?)("[\S\s]*?/?>)`)
	re_url := regexp.MustCompile(`(?i)^https?://.*`)

	img_tags := re_find.FindAllString(src, -1)
	for _, t := range img_tags {
		img_src := re_find.ReplaceAllString(t, "$2")

		if re_url.MatchString(img_src) {
			continue
		}
		b64img, err := decodeBase64(img_src, parent)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			continue
		}

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

func decodeBase64(src, parent string) (string, error) {
	path := src
	if !filepath.IsAbs(path) {
		path = filepath.Join(parent, path)
	}
	f, err := os.Open(path)
	if err != nil {
		pathErr := err.(*os.PathError)
		errno := pathErr.Err.(syscall.Errno)
		if errno != 0x7B { // suppress ERROR_INVALID_NAME
			fmt.Fprintln(os.Stderr, err)
			return "", nil
		}
		return "", err
	}
	defer f.Close()

	d, err := ioutil.ReadAll(f)
	if err != nil {
		return "", err
	}

	dest := base64.StdEncoding.EncodeToString(d)
	return dest, nil
}

func parseImageOpt(src string) (string, error) {
	dest := src

	re := regexp.MustCompile(`(<img[\S\s]+?src=)"([\S\s]+?)\?(\S+?)"([\S\s]*?/?>)`)
	dest = re.ReplaceAllStringFunc(dest, func(s string) string {
		res := re.FindStringSubmatch(s)
		return res[1] + "\"" + res[2] + "\" " + strings.Join(strings.Split(res[3], "&amp;"), " ") + res[4]
	})
	return dest, nil
}

func replaceMathJaxCodeBlock(src string) (string, error) {
	sr := strings.NewReader(src)
	doc, err := goquery.NewDocumentFromReader(sr)
	if err != nil {
		return src, err
	}

	code := doc.Find("pre>code.language-math")
	code.Each(func(index int, s *goquery.Selection) {
		s.Parent().ReplaceWithHtml("<p>$$" + s.Text() + "$$</p>")
	})

	return doc.Find("body").Html()
}

func replaceCheckBox(src string) (string, error) {
	sr := strings.NewReader(src)
	doc, err := goquery.NewDocumentFromReader(sr)
	if err != nil {
		return src, err
	}

	doc.Find("li").Each(func(i int, li *goquery.Selection) {
		li.Contents().Each(func(j int, c *goquery.Selection) {
			if goquery.NodeName(c) == "#text" {
				li.Find("input").Each(func(k int, input *goquery.Selection) {
					if t, exist := input.Attr("type"); exist && t == "checkbox" {
						li.AddClass("task-list-item")
					}
				})
			}
		})
	})

	return doc.Find("body").Html()
}

func replaceTableSpan(src string) (string, error) {
	sr := strings.NewReader(src)
	doc, err := goquery.NewDocumentFromReader(sr)
	if err != nil {
		return src, err
	}

	re := regexp.MustCompile("\u00a6\\s*")

	doc.Find("table").Each(func(i int, tbl *goquery.Selection) {
		tbl.Find("tbody").Each(func(j int, tbody *goquery.Selection) {
			trs := tbody.Find("tr")
			// colspan
			colmax := 0
			trs.Each(func(k int, tr *goquery.Selection) {
				tds := tr.Find("td")
				colmns := tds.Length()
				if colmns > colmax {
					colmax = colmns
				}
				col := 0
				tds.Each(func(l int, td *goquery.Selection) {
					col++
					td.Contents().Each(func(m int, c *goquery.Selection) {
						cnt := len(re.FindAllIndex([]byte(c.Text()), -1))
						if cnt > 0 {
							td.SetAttr("colspan", strconv.Itoa(cnt+1))
							c.ReplaceWithHtml(re.ReplaceAllString(c.Text(), ""))
							col += cnt
						}
					})
					if col > colmns {
						td.SetAttr("hidden", "")
					}
				})
			})
			// rowspan
			for m := 0; m < colmax; m++ {
				var root *goquery.Selection
				cnt := 0
				trs.Each(func(k int, tr *goquery.Selection) {
					tr.Find("td").Each(func(l int, td *goquery.Selection) {
						if l == m {
							atd := getActualTD(tr, l)
							if k == 0 {
								root = atd
							} else {
								if atd.Text() != "" {
									cnt = 0
									root = atd
								} else {
									cnt++
									root.SetAttr("rowspan", strconv.Itoa(cnt+1))
									atd.SetAttr("hidden", "")
								}
							}
						}
					})
				})
			}
			// remove hidden <td>
			tbody.Find("tr>td").Each(func(i int, td *goquery.Selection) {
				if _, hidden := td.Attr("hidden"); hidden {
					td.Remove()
				}
			})
		})
		// remove empty header
		empty := true
		tbl.Find("thead").Each(func(i int, thead *goquery.Selection) {
			thead.Find("tr>th").EachWithBreak(func(j int, th *goquery.Selection) bool {
				if th.Text() != "" {
					empty = false
					return false
				}
				return true
			})
			if empty {
				thead.Remove()
			}
		})
	})

	return doc.Find("body").Html()
}

func getActualTD(tr *goquery.Selection, index int) *goquery.Selection {
	pos := 0
	var result *goquery.Selection
	tr.Find("td").EachWithBreak(func(i int, td *goquery.Selection) bool {
		cs, _ := strconv.Atoi(td.AttrOr("colspan", "1"))
		pos += cs
		if pos >= index+1 {
			result = td
			return false
		}
		return true
	})

	return result
}
