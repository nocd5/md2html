# Custom CSS Sample

## Command Option

```bash
$ md2html example/custom-css.md -c example/css/custom-css.css
```

#### Example for `wheel` class

```markdown
<img class="vinyl ep" src="img/nocd5.png">
<img class="vinyl lp" src="img/nocd5.png">
```

#### Custom CSS for `wheel`

```css
/* example/css/custom-css.css */

img.vinyl {
    margin: 12px;
}

img.vinyl.ep {
    animation: spin calc(60s / 45) linear infinite;
}

img.vinyl.lp {
    animation: spin calc(60s / (33 + 1 / 3)) linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
}
```

<img class="vinyl ep" src="img/nocd5.png">
<img class="vinyl lp" src="img/nocd5.png">
