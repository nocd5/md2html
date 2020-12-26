document.addEventListener('DOMContentLoaded', function() {
    var toc = document.getElementById('markdown-toc');
    // if without option "--toc/-t" do nothing
    if (toc == null) {
        return;
    }

    // wrapper for scrollbar on left side
    var scroll = document.createElement('div');
    scroll.classList.add('scroll');
    // add button element before calling getElementById/getElementsByClassName
    var button = document.createElement('div');
    button.classList.add('toc-button');
    // get anchor
    var anchor = document.querySelectorAll('h1,h2,h3,h4');

    // generate TOC
    var toclist = document.createElement('ul');
    [].forEach.call(anchor, function(c) {
        var li = document.createElement('li');
        li.classList.add('toc-' + c.tagName.toLowerCase());
        var a = document.createElement('a');
        a.setAttribute('href', '#' + c.id);
        a.textContent = c.textContent;
        li.appendChild(a);
        toclist.appendChild(li);
    });
    scroll.appendChild(toclist);
    // show scrollbar on left side
    toc.style.direction = 'rtl';
    scroll.style.direction = 'ltr';
    toc.appendChild(scroll);

    // TOC toggle button
    button.onclick = function() {
        if (toc.offsetWidth > 0) {
            button.style.background = config.button.color.active;
            button.style.transform = 'rotate(-45deg)';
            toc.style.width = 0;
            toc.style.minWidth = 0;
        }
        else {
            button.style.background = config.button.color.bg;
            button.style.transform = 'rotate(0)';
            toc.style.width = config.toc.width;
            toc.style.minWidth = config.toc.minwidth;
        }
    }
    document.body.appendChild(button);

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
