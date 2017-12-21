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
    [].forEach.call(document.getElementsByTagName('LI'), function(li) {
        [].forEach.call(li.childNodes, function(childNode) {
            if (childNode.tagName == 'P') {
                childNode.outerHTML = childNode.innerHTML;
            }
            if (childNode.nodeName == '#text') {
                if (childNode.data.substr(0,3) == "[ ]") {
                    var checkbox = document.createElement('input');
                    checkbox.type = "checkbox"
                    childNode.data = childNode.data.substr(3)
                    li.insertBefore(checkbox, li.childNodes[0]);
                    li.classList.add('task-list-item')
                }
                else if (childNode.data.substr(0,3) == "[x]") {
                    var checkbox = document.createElement('input');
                    checkbox.type = "checkbox"
                    checkbox.checked = "checked"
                    childNode.data = childNode.data.substr(3)
                    li.insertBefore(checkbox, li.childNodes[0]);
                    li.classList.add('task-list-item')
                }
            }
        });
    });

    // translate column
    var recol = new RegExp('\u00a6\\s*', 'g');
    var trans_col = function(rows, elm) {
        [].forEach.call(rows, function(row) {
            var cells = row.querySelectorAll(elm);
            var ts = 0;
            Array.prototype.forEach.call(cells, function(cell) {
                var seps = cell.innerHTML.match(recol)
                if (seps != null && seps.length > 0) {
                    cell.innerHTML = cell.innerHTML.replace(recol, '');
                    ts += seps.length;
                    cell.setAttribute('colspan', 1 + seps.length);
                }
            });
            for (var i = 1; i <= ts; i++) {
                cells[cells.length-i].outerHTML = '';
            }
        });
    };
    // translate row
    var get_colpos = function(row, n) {
        var pos = 0;
        var i = 0;
        while (true) {
            var s = row[pos].getAttribute('colspan');
            i += s == null ? 1 : Number(s);
            if (i > n) {
                break;
            }
            pos++;
        }
        return pos;
    };
    var trans_row = function(rows, elm) {
        var datalist = [];
        var maxcol = 0;
        [].forEach.call(rows, function(row) {
            var cells = row.querySelectorAll(elm);
            datalist.push(cells);
            var col = 0;
            [].forEach.call(cells, function(cell) {
                var s = cell.getAttribute('colspan');
                col += s == null ? 1 : Number(s);
            });
            maxcol = Math.max(maxcol, col);
            i++;
        });
        for (var i = 0; i < maxcol; i++) {
            var span = 0;
            var root = get_colpos(datalist[0], i);
            for (var j = 1; j < datalist.length; j++) {
                var cur = get_colpos(datalist[j], i);
                if (datalist[j][cur] != null && datalist[j][cur].innerHTML == '') {
                    span++;
                    if (datalist[j - span] != null && datalist[j - span][root] != null) {
                        datalist[j - span][root].setAttribute('rowspan', 1 + span);
                        if (datalist[j][cur].parentNode != null) {
                            datalist[j][cur].outerHTML = '';
                        }
                    }
                }
                else {
                    root = get_colpos(datalist[j], i);
                    span = 0;
                }
            }
        }
    };
    [].forEach.call(document.querySelectorAll('table'), function(tbl) {
        // thead
        var headrows = tbl.querySelectorAll('thead > tr');
        trans_col(headrows, 'th');
        trans_row(headrows, 'th');
        // tbody
        var rows = tbl.querySelectorAll('tbody > tr');
        trans_col(rows, 'td');
        trans_row(rows, 'td');
    });
}, false);
