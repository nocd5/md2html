document.addEventListener('DOMContentLoaded', function() {
    // if without option "--toc/-t" do nothing
    if (document.getElementById('markdown-toc') == null) {
        return;
    }

    var body, anchor, toc, scroll, button;
    // add button element before calling getElementById/getElementsByClassName
    document.body.innerHTML =  document.body.innerHTML + '<div class="toc-button"></div>';
    button = document.getElementsByClassName('toc-button')[0];
    anchor = document.querySelectorAll('h1,h2,h3,h4');
    body = document.getElementsByClassName('markdown-body')[0];
    toc = document.getElementById('markdown-toc');
    // wrapper for scrollbar on left side
    toc.innerHTML = '<div class="scroll">' + toc.innerHTML + '</div>';
    scroll = document.querySelector('#markdown-toc > .scroll');

    // generate TOC
    var toclist = document.createElement('ul');
    scroll.appendChild(toclist);
    [].forEach.call(anchor, function(c) {
        var li = document.createElement('li');
        li.classList.add('toc-' + c.tagName.toLowerCase());
        var a = document.createElement('a');
        a.setAttribute('href', '#' + c.id);
        a.textContent = c.textContent;
        li.appendChild(a);
        toclist.appendChild(li);
    });
    // show scrollbar on left side
    toc.style.direction = 'rtl';
    scroll.style.direction = 'ltr';

    // TOC toggle button
    button.onclick = function() {
        if (toc.offsetWidth > 0) {
            button.style.background = config.button.color.active;
            button.style.transform = 'rotate(-45deg)';
            toc.style.overflowY = 'hidden';
            toc.style.width = 0;
            toc.style.minWidth = 0;
        }
        else {
            button.style.background = config.button.color.bg;
            button.style.transform = 'rotate(0)';
            toc.style.width = config.toc.width;
            toc.style.minWidth = config.toc.minwidth;
            toc.style.overflowY = 'auto';
        }
    }

    // Smooth Scroll
    SmoothScroll('a[href*="#"]');

    // TOC Highlight
    function highlight() {
        var scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
        var active = anchor[0];
        for (var i = 0; i < anchor.length; i++) {
            var rect = anchor[i].getBoundingClientRect();
            if (rect.top > 0) {
                if (rect.top < Math.abs(active.getBoundingClientRect().top)) {
                    active = anchor[i];
                }
                break;
            }
            active = anchor[i];
        }
        [].forEach.call(document.getElementsByClassName('toc-active'), function(c) {
            c.classList.remove('toc-active');
        });
        toc.querySelector('a[href="#' + active.id + '"]').parentNode.classList.add('toc-active');
    }
    var timeout;
    window.onscroll = function() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function() {
            highlight();
        }, 50);
    };
    highlight();

}, false);
