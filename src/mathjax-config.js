MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        packages: {
            '[+]': ['physics', 'color']
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let mutationObserver = new MutationObserver(() => {
        if (document.querySelector('div.CtxtMenu_Menu')) {
            let menuItems = document.querySelectorAll('div.CtxtMenu_MenuItem');
            [].forEach.call(menuItems, e => {
                if (e.textContent.match(/^Language.*/) ||
                    e.textContent.match(/^Accessibility.*/) ||
                    e.textContent.match(/^CHTML.*/)) {
                    e.parentNode.removeChild(e);
                }
            });
        }
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});
