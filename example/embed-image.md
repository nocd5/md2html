# Embed Image Sample

## Command Option

```bash
$ md2html example/embed-image.md -e
```

### Local file is embedded

```markdown
![logo/nocd5](img/nocd5.png "nocd5")
```

![logo/nocd5](img/nocd5.png "nocd5")

#### Write HTML tag immediately

```markdown
<img src="img/nocd5.png" width="48">
<img src="img/nocd5.png" width="32">
<img src="img/nocd5.png" width="16">
```

<img src="img/nocd5.png" width="48">
<img src="img/nocd5.png" width="32">
<img src="img/nocd5.png" width="16">

### image as URL link is not embedded

```markdown
![google/errors/robot](https://www.google.com/images/errors/robot.png "robot")
```

![google/errors/robot](https://www.google.com/images/errors/robot.png "robot")
