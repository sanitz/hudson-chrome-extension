var DEFAULT_URL = 'http://hudson.grails.org/';

var GREEN = [0, 128, 0, 255];
var RED = [255, 0, 0, 255];
var GREY = [128, 128, 128, 255];

var second = 1000;
var minute = 60 * second;

var pollInterval = 1 * minute;
var requestTimeout = 2 * second;
var requestFailureCount = 0;

chrome.browserAction.onClicked.addListener( goHudson );

function init() {
    chrome.browserAction.setTitle({ title: "Hudson " + getHudsonUrl()});
    startRequest();
}

function scheduleRequest() {
    window.setTimeout(startRequest, pollInterval);
}

function setStatus(text, color) {
    chrome.browserAction.setBadgeText({ text:  text });
    chrome.browserAction.setBadgeBackgroundColor({ color:  color });
}

function startRequest() {
    getBuildStatus(
        function(jobs) {
            var success = jobs.every(function (job) { 
                return job.color == 'blue' || job.color == 'blue_anime';
            });
            if (success) { 
                setStatus("OK", GREEN); 
            } else { 
                setStatus("Fail", RED); 
            }
            scheduleRequest();
        },
        function() {
            setStatus("?", GREY); 
            scheduleRequest();
        }
    );
}
    
function getBuildStatus(onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    var abortTimerId = window.setTimeout(function() { 
        xhr.abort(); }, requestTimeout);

    function handleSuccess(jobs) {
        requestFailureCount = 0;
        window.clearTimeout(abortTimerId);
        if (onSuccess)
            onSuccess(jobs);
    }

    function handleError() {
        ++requestFailureCount;
        window.clearTimeout(abortTimerId);
        if (onError)
            onError();
    }
    
    try {
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.responseText) {
                var response = JSON.parse(xhr.responseText);
                if (response.jobs) {
                    handleSuccess(response.jobs);
                    return;
                } 
            }
            handleError();
        }
        xhr.onerror = function() { setStatus("???", GREY); };
        xhr.open("GET", getFeedUrl(), true);
        xhr.send(null);
    } catch(e) {
        handleError();
    }
}

function getFeedUrl() {
    return  getHudsonUrl() + 'api/json';
}

function getHudsonUrl() {
    if (localStorage.hudsonUrl)
        return localStorage.hudsonUrl;
    return DEFAULT_URL;
}

function isHudsonUrl(url) {
    var hudson = getHudsonUrl();
    if (url.indexOf(hudson) != 0)
        return false;
    return url.length == hudson.length || url[hudson.length] == '?' ||
                       url[hudson.length] == '#';
}


function goHudson() {
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url && isHudsonUrl(tab.url)) {
                chrome.tabs.update(tab.id, {selected: true});
                return;
            }
        }
        chrome.tabs.create({url: getHudsonUrl()});
  });
}
