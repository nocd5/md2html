document.addEventListener('DOMContentLoaded', function() {
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
