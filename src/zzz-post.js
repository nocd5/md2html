document.addEventListener('DOMContentLoaded', function() {
    // if without option "--toc/-t" do nothing
    if (document.getElementById('markdown-toc') != null) {
        var body, toc, scroll, button;
        // add button element before calling getElementById/getElementsByClassName
        document.body.innerHTML =  document.body.innerHTML + '<div class="toc-button"></div>';
        button = document.getElementsByClassName('toc-button')[0];
        body = document.getElementsByClassName('markdown-body')[0];
        toc = document.getElementById('markdown-toc');
        // wrapper for scrollbar on left side
        toc.innerHTML = '<div class="scroll">' + toc.innerHTML + '</div>';
        scroll = document.querySelector('#markdown-toc > .scroll');

        // generate TOC
        $(scroll).toc({ selectors: 'h1,h2,h3,h4', highlightOffset: 0 });
        // show scrollbar on left side
        toc.style.direction = 'rtl';
        scroll.style.direction = 'ltr';

        // take clearance for TOC area
        window.onload = window.onresize = function() {
            body.style.marginLeft = toc.offsetWidth + 'px';
        };

        // TOC toggle button
        var option = {
            duration: config.button.duration,
            step: function() {
                body.style.marginLeft = toc.offsetWidth + 'px';
            }
        };
        $(button).click(function() {
            if (toc.offsetWidth > 0) {
                $(button).css({
                    background: config.button.color.active,
                    transform: 'rotate(-45deg)'
                });
                $(toc).css({ overflowY: 'hidden' });
                $(toc).animate({ width: '0', minWidth: '0' }, option);
            }
            else {
                $(button).css({
                    background: config.button.color.bg,
                    transform: 'rotate(0)'
                });
                $(toc).css({ overflowY: 'auto' });
                $(toc).animate({ width: config.toc.width, minWidth: config.toc.minwidth }, option);
            }
        });
    }

    // CheckBox
    var list = document.getElementsByTagName('LI');
    for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].childNodes.length; j++) {
            if (list[i].childNodes[j].tagName == 'P') {
                list[i].childNodes[j].outerHTML = list[i].childNodes[j].innerHTML;
            }
            if (list[i].childNodes[j].nodeName == '#text') {
                if (list[i].childNodes[j].data.substr(0,3) == "[ ]") {
                    var checkbox = document.createElement('input');
                    checkbox.type = "checkbox"
                    list[i].childNodes[j].data = list[i].childNodes[j].data.substr(3)
                    list[i].insertBefore(checkbox, list[i].childNodes[0]);
                    list[i].classList.add('task-list-item')
                }
                else if (list[i].childNodes[j].data.substr(0,3) == "[x]") {
                    var checkbox = document.createElement('input');
                    checkbox.type = "checkbox"
                    checkbox.checked = "checked"
                    list[i].childNodes[j].data = list[i].childNodes[j].data.substr(3)
                    list[i].insertBefore(checkbox, list[i].childNodes[0]);
                    list[i].classList.add('task-list-item')
                }
            }
        }
    }

    // colspan
    var recol = new RegExp('\u00a6\\s*', 'g');
    var colspan = function(cells) {
        var cellary = Array.prototype.slice.call(cells, 0)
        var n = 0;
        for (var i = 1; i < cells.length; i++) {
            var seps = cellary[i].innerHTML.match(recol)
            if (seps != null && seps.length > 0) {
                cellary[i].innerHTML = cellary[i].innerHTML.replace(recol, '');
                n = n + seps.length;
                cellary[i].setAttribute('colspan', 1 + seps.length);
            }
        }
        for (var j = 1; j <= n; j++) {
            cellary[cells.length-j].outerHTML = '';
        }
    }
    // rowspan
    var colpos = function(row, n) {
        var pos = 0;
        var i = 0;
        while (pos < n) {
            i++;
            var s = row[i].getAttribute('colspan');
            pos += s == null ? 1 : Number(s);
        }
        return i;
    }
    var rowspan = function(rows, elm) {
        var rowary = Array.prototype.slice.call(rows, 0)
        var cells = [];
        var maxcol = 0;
        for (var i = 0; i < rows.length; i++) {
          cells.push(Array.prototype.slice.call(rows[i].querySelectorAll(elm), 0));
          maxcol = Math.max(maxcol, cells[i].length);
        }
        for (var i = 0; i < maxcol; i++) {
            var n = 0;
            var t = 0;
            for (var j = 1; j < cells.length; j++) {
                var jp = colpos(cells[j], i);
                if (cells[j][jp] != null && cells[j][jp].innerHTML == '') {
                    n++;
                    if (cells[j - n] != null && cells[j - n][colpos(cells[t], i)] != null) {
                        cells[j - n][colpos(cells[t], i)].setAttribute('rowspan', 1 + n);
                    }
                    if (cells[j][jp].parentNode != null) {
                        cells[j][jp].outerHTML = '';
                    }
                }
                else {
                    t = j;
                    n = 0;
                }
            }
        }
    }
    var tbls = document.querySelectorAll('table');
    Array.prototype.slice.call(tbls, 0).forEach(function(tbl, _) {
        // thead
        var headrows = tbl.querySelectorAll('thead > tr');
        Array.prototype.slice.call(headrows, 0).forEach(function(row, _) {
            colspan(row.querySelectorAll('th'));
        });
        rowspan(headrows, 'th');
        // tbody
        var rows = tbl.querySelectorAll('tbody > tr');
        Array.prototype.slice.call(rows, 0).forEach(function(row, _) {
            colspan(row.querySelectorAll('td'));
        });
        rowspan(rows, 'td');
    });
}, false);
