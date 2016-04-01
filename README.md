# md2html

Markdown to single HTML converter

## Installation

`go get github.com/nocd5/md2html`

## Usage

`md2html -i <input Markdown> [-o <output HTML>] [-e]`

if `-o` option was abbreviated, `input Markdown file name` + `.html` will be used as output HTML file name.

### Embedding images

`-e/--embed` option enables embedding images that are located local storage by Base64 encoding.

## Using custom css

```sh
$ go get -d github.com/nocd5/md2html
$ cd $GOPATH/src/github.com/nocd5/md2html
```

customize `$GOPATH/src/github.com/nocd5/md2html/assets`

```sh
$ $GOPATH/src/github.com/nocd5/md2html/assets.go.rb
$ go install
```

Acknowledgement
---------------

- [mattn/mkup](https://github.com/mattn/mkup)
