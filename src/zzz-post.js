document.addEventListener('DOMContentLoaded', function(){
    var body, toc, scroll;

    body = document.getElementsByClassName('markdown-body')[0];
    toc = document.getElementById('markdown-toc');
    // wrapper for scrollbar on left side
    toc.innerHTML = '<div class="scroll">' + toc.innerHTML + '</div>';
    scroll = document.querySelector('#markdown-toc > .scroll');

    // take clearance for TOC area
    window.onload = window.onresize = function(){
        body.style.marginLeft = toc.offsetWidth + 'px';
    };

    // show scrollbar on left side
    toc.style.direction = 'rtl';
    scroll.style.direction = 'ltr';

    // generate TOC
    $('#markdown-toc > .scroll').toc({'selectors': 'h1,h2,h3,h4', 'highlightOffset': 0});
}, false);
