document.addEventListener('DOMContentLoaded', function(){
config = {
  "color": {
    "bg": "#333",
    "fg": "#fff",
    "active": "#48c",
    "hover": "#444"
  },
  "toc": {
    "width": "20%",
    "minwidth": "200px",
    "shiftwidth": "1em",
    "lineheight": 2
  },
  "button": {
    "size": "16px",
    "color": {
      "bg": "#f66",
      "active": "#4b3"
    },
    "duration": 200
  }
}
    // if without option "--toc/-t" do nothin
    if (document.getElementById('markdown-toc') == null) return;

    var body, toc, scroll;
    // add button element before calling getElementById/getElementsByClassName
    document.body.innerHTML =  document.body.innerHTML + '<div class="toc-button"></div>';
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

    // TOC toggle button
    var duration = 500;
    $('.toc-button').click(function() {
        function rotate(deg) {
            $('.toc-button').animate({'z-index': 1}, {
                duration: duration,
                step: function(num) {
                    $(this).css({
                        transform: 'rotate(' + (num * 45 + deg) + 'deg)'
                    });
                },
                complete: function () {
                    $('.toc-button').css('z-index', 0);
                }
            });
        }
        if (toc.offsetWidth > 0) {
            rotate(0);
            $('.toc-button').css('background', 'rgb(' + 0x40 + ',' + 0xb0 + ',' + 0x30 + ')');
            $('#markdown-toc').animate({ width: '0', minWidth: '0' }, {
                duration: duration,
                step: function() {
                    $('.markdown-body').css({ marginLeft: toc.offsetWidth + 'px' });
                }
            });
        }
        else {
            rotate(45);
            $('.toc-button').css('background', 'rgb(' + 0xf0 + ',' + 0x60 + ',' + 0x60 + ')');
            $('#markdown-toc').animate({ width: '20%', minWidth: '200px' }, {
                duration: duration,
                step: function() {
                    $('.markdown-body').css({ marginLeft: toc.offsetWidth + 'px' });
                }
            });
        }
    });

    // Workaround:
    // on Fx, first time closing #markdown-toc does not resize .markdown-body.
    // IE and Chrome is OK.
    $('#markdown-toc').animate({ width: '20%', minWidth: '200px' }, 1);
}, false);
