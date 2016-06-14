document.addEventListener('DOMContentLoaded', function() {
    // if without option "--toc/-t" do nothing
    if (document.getElementById('markdown-toc') == null) return;

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
            $(toc).animate({ width: '0', minWidth: '0' }, option);
        }
        else {
            $(button).css({
                background: config.button.color.bg,
                transform: 'rotate(0)'
            });
            $(toc).animate({ width: config.toc.width, minWidth: config.toc.minwidth }, option);
        }
    });
}, false);
