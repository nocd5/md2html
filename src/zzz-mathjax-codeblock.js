document.addEventListener('DOMContentLoaded', function() {
    var lngmath = document.getElementsByClassName('language-math');
    // loop backward for keep index of HTMLCollection
    for (i = lngmath.length-1; i >= 0; i--) {
        if (lngmath[i].tagName == 'PRE') {
            var code = lngmath[i].getElementsByClassName('language-math');
            var mj = document.createElement('p');
            mj.innerHTML = '$$'
            for (j = 0; j < code.length; j++) {
                mj.innerHTML += code[j].innerHTML
            }
            mj.innerHTML += '$$'
            lngmath[i].parentNode.insertBefore(mj, lngmath[i].nextSibling);
            lngmath[i].parentNode.removeChild(lngmath[i]);
        }
    }
}, false);
