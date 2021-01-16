const fs = require('fs');
const path = require('path');

let js = '';
let mathjax = '';
let mathjax_cfg = '';
let css = '';

const files = fs.readdirSync(path.join(__dirname, 'assets'))
                .map(f => path.join(__dirname, 'assets', f));

files.filter(f => path.extname(f) == '.js').forEach(f => {
  if (path.basename(f).match(/mathjax/i)) {
    if (path.basename(f).match(/config/i)) {
      mathjax_cfg += '<script type="text/javascript">\n';
      mathjax_cfg += fs.readFileSync(f, { encoding: 'utf8' });
      mathjax_cfg += '\n</script>\n';
    }
    else {
      mathjax += '<script type="text/javascript">\n';
      mathjax += fs.readFileSync(f, { encoding: 'utf8' });
      mathjax += '\n</script>\n';
    }
  }
  else {
    js += '<script type="text/javascript">\n';
    js += fs.readFileSync(f, { encoding: 'utf8' });
    js += '\n</script>\n';
  }
});

files.filter(f => path.extname(f) == '.css').forEach(f => {
  css += '<style type="text/css">\n';
  css += fs.readFileSync(f, { encoding: 'utf8' });
  css += '\n</style>\n';
});

const str2bytes = str => [...Buffer.from(str)]
  .map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
  .join(', ')
  .replace(/(?:0x\w{2},\s*){16}/g, '$&\n')
  .replace(/\s+\n/g, '\n');

let js_bytes = str2bytes(js);
let mathjax_bytes = str2bytes(mathjax);
let mathjax_cfg_bytes = str2bytes(mathjax_cfg);
let css_bytes = str2bytes(css);

const content = `package main

var js_bytes = [...]byte{
	${js_bytes.replace(/\n/g, '\n\t')},
}
var mathjax_cfg_bytes = [...]byte{
	${mathjax_cfg_bytes.replace(/\n/g, '\n\t')},
}
var mathjax_bytes = [...]byte{
	${mathjax_bytes.replace(/\n/g, '\n\t')},
}
var css_bytes = [...]byte{
	${css_bytes.replace(/\n/g, '\n\t')},
}
`;

fs.writeFile(path.join(__dirname, 'assets.go'), content, err => {
  if (err) {
    console.log(err.message);
  }
});

