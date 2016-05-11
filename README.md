# md2html

Markdown to single HTML converter

## Installation

`go get github.com/nocd5/md2html`

## Usage

`md2html -i <input Markdown> [-o <output HTML>] [-e] [-t]`

if `-o` option was abbreviated, `input Markdown file name` + `.html` will be used as output HTML file name.

### Embedding images

`-e/--embed` option enables embedding images that are located local storage by Base64 encoding.

### TOC

`-t/--toc` option enables generating TOC.

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

$ npm intall && gulp
$ assets.go.rb
$ go install
```

## Use libraries

#### Go

- [jessevdk/go-flags](https://github.com/jessevdk/go-flags)
- [russross/blackfriday](https://github.com/russross/blackfriday)
    - Fork and implement GFM like task list  
      [nocd5/blackfriday](https://github.com/nocd5/blackfriday)

#### JS

- [PrismJS/prism](https://github.com/PrismJS/prism)
- [jquery/jquery](https://github.com/jquery/jquery)
- [jgallen23/toc](https://github.com/jgallen23/toc)

## Acknowledgement

- [mattn/mkup](https://github.com/mattn/mkup)
