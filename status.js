var hudson = hudson || {};

hudson.status = function() {
    
    function showUrl(evt) {
        var url = evt.currentTarget.href,
            hudson = chrome.extension.getBackgroundPage().hudson;
        hudson.open(url);
        window.close();
    }

    function link(url, name) {
        if (name == undefined) {
            name = url;
        }
        var link = document.createElement('a');
        link.innerText = name;
        link.href = url;
        link.addEventListener("click", showUrl);
        return link;
    }

    function asIcon(result) {
        var icon = document.createElement('img'),
            name = result.color;
        if (name === 'aborted' || name === 'disabled') {
            name = 'grey';
        }
        icon.src = name + ".gif";
        return icon;
    }

    function createList(jobs) {
        var list = document.createElement('table');
        jobs.forEach(function(r) {
            var tr = document.createElement('tr'), 
                tdIcon = document.createElement('td'),
                tdName = document.createElement('td');
            tr.className = "feedList";
            tdIcon.appendChild(asIcon(r));
            tdName.appendChild(link(r.url, r.name));
            tr.appendChild(tdIcon);
            tr.appendChild(tdName);
            list.appendChild(tr);
        });
        return list;
    }

    function timeSince(d) {
        var now = new Date(),
            minutes = Math.round((now.getTime() - d.getTime()) / (1000 * 60));
        return d.toLocaleTimeString() + " (" + minutes + " minute" + (1 == minutes ? "" : "s") + " ago)";
    }

    function createRefreshLink() {
        var link = document.createElement('button');
        link.innerText = "Refresh";
        link.addEventListener("click", refreshStatus);
        return link;
    }

    function refreshStatus(evt) {
        var button_clicked = evt.currentTarget;
        button_clicked.setAttribute('disabled', true);
        var background = chrome.extension.getBackgroundPage().hudson;
        background.results.onChange = function () {
            background.results.onChange = undefined;
            hudson.status.show();
            button_clicked.removeAttribute('disabled');
        };
        background.start();
    }

    function removeChildren(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    return { show : function () {
        var hudson = chrome.extension.getBackgroundPage().hudson, 
            options = document.getElementById('options'), 
            lastUpdate = document.createElement('div'), 
            content = document.getElementById('build_result'),
            heading = document.getElementById('heading'),
            refresh_url = document.getElementById('refresh_url'),
            url = document.createElement('div');
        
        heading.innerText = "Hudson Status ";
        removeChildren(refresh_url);
        refresh_url.appendChild(createRefreshLink());
        
        removeChildren(content);
        url.className = 'url';
        url.appendChild(link(hudson.conf.hudsonURL()));
        content.appendChild(url);
        if (hudson.results.error) {
            var err = document.createElement('div');
            err.className = 'error';
            err.innerText = hudson.results.error
            content.appendChild(err);
        } else {
            var list = createList(hudson.results.hudson.jobs);
            content.appendChild(list);
        }
        
        removeChildren(options);
        lastUpdate.innerText = "Last Update: " + timeSince(hudson.results.lastUpdate);
        options.appendChild(lastUpdate);
        options.appendChild(link(chrome.extension.getURL('options.html'), 'Options'));
    }}
}();
//yet another event handler
window.onload = hudson.status.show;
