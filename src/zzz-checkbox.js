document.addEventListener('DOMContentLoaded', function() {
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
                    checkbox.setAttribute('checked', '');
                    childNode.data = childNode.data.substr(3)
                    li.insertBefore(checkbox, li.childNodes[0]);
                    li.classList.add('task-list-item')
                }
            }
        });
    });
}, false);
