# md2html

[![Build status](https://github.com/nocd5/md2html/workflows/Build/badge.svg?branch=master)](https://github.com/nocd5/md2html/actions?query=workflow%3ABuild+branch%3Amaster)
![Test status](https://github.com/nocd5/md2html/workflows/Test/badge.svg?branch=master)

**md2html generates a single-file HTML document from Markdown.** Scripts, CSS, and images can be all embedded in the HTML, allowing the output file to be viewed offline without requiring any conveyed resources.

## Quickstart

This command will create `example.md.html`

```sh
md2html example.md
```

```

## Documentation

`GO111MODULE=on go get github.com/nocd5/md2html`
Full Documentation: [https://nocd5.github.io/md2html](https://nocd5.github.io/md2html/index.html)

_Note: md2html was used to generate the documentation page:_

```bash
$ md2html example/*.md -e -t -m -s -f example/img/nocd5.png -c example/css/custom-css.css -o gh-pages/index.html
```

## Usage

`md2html -i <input Markdown> [-o <output HTML>] [-e] [-t] [-m] [-s] [-f <path to icon>]`

if `-o` option was abbreviated, `input Markdown file name` + `.html` will be used as output HTML file name.

### Embedding images

`-e/--embed` option enables embedding images that are located local storage by Base64 encoding.

### TOC

`-t/--toc` option enables generating TOC.

### Using MathJax

`-m/--mathjax` option enables using MathJax.

### Table row/col span

`-s/--span` option enables using rowspan/colspan for table tag

### Favicon

`-f/--favicon <path/to/icon>` option enables embedding icon for favicon

### Add custom CSS

`-c/--css <path/to/css>` option enables additional CSS

## Example

Please execute the following commands to make example files.

```bash
# make html files from each markdown files
$ md2html -e example/*.md

# make a concatinated single html file from markdown files
$ md2html -e -t example/*.md -o example/concat.html
```

## Custom JS & CSS

```bash
$ go get -d github.com/nocd5/md2html
$ cd ${GOPATH}/src/github.com/nocd5/md2html

###########################################################
# customize "{$GOPATH}/src/github.com/nocd5/md2html/src/" #
###########################################################

$ npm install && gulp
$ assets.go.rb
$ go install
```

## Use libraries

#### Go

- [yuin/goldmark](https://github.com/yuin/goldmark)
  ([License](https://raw.githubusercontent.com/yuin/goldmark/master/LICENSE))
- [yuin/goldmark-highlighting](https://github.com/yuin/goldmark-highlighting)
  ([License](https://raw.githubusercontent.com/yuin/goldmark-highlighting/master/LICENSE))
- [PuerkitoBio/goquery](https://github.com/PuerkitoBio/goquery)
  ([License](https://raw.githubusercontent.com/PuerkitoBio/goquery/master/LICENSE))
- [jessevdk/go-flags](https://github.com/jessevdk/go-flags)
  ([License](https://raw.githubusercontent.com/jessevdk/go-flags/master/LICENSE))

#### JS

- [pkra/MathJax-single-file](https://github.com/pkra/MathJax-single-file)
  ([License](https://raw.githubusercontent.com/pkra/MathJax-single-file/master/LICENSE))
- [cferdinandi/smooth-scroll](https://github.com/cferdinandi/smooth-scroll)
  ([License](https://raw.githubusercontent.com/cferdinandi/smooth-scroll/master/LICENSE.md))

#### CSS
- [sindresorhus/generate-github-markdown-css](https://github.com/sindresorhus/generate-github-markdown-css)
  ([License](https://raw.githubusercontent.com/sindresorhus/generate-github-markdown-css/master/license))
