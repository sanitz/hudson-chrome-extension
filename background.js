var hudson = hudson || {};
hudson.results = {
    lastUpdate : 'never',
    lastJobs : undefined,
    onChange : undefined
};

hudson.open = function() {
    function sameUrl(orig, other) {
        if (other.indexOf(orig) != 0)
            return false;
        return other.length == orig.length ||
            other[orig.length] == '?' ||
            other[orig.length] == '#';
    }

    return function (url) {
        chrome.tabs.getAllInWindow(undefined, function(tabs) {
            for (var i = 0, tab; tab = tabs[i]; i++) {
                if (tab.url && sameUrl(url, tab.url)) {
                    chrome.tabs.update(tab.id, { selected : true });
                    return;
                }
            }
            chrome.tabs.create({ url: url });
        });
    };
}();

hudson.init = function (conf, results) {
    var xhr = undefined,
        timeoutId = undefined,
        successColors = /(blue|grey|disabled)/,
        build = {
            ok :   {    msg : "OK",     color : [0, 128, 0, 255] },
            failed : {  msg : "Fail",   color : [255, 0, 0, 255] },
            unknown: {  msg : "?",      color : [128, 128, 128, 255] },
        };

    function setState(state, msg) {
        console.log(state, msg, new Date());
        chrome.browserAction.setBadgeText({ text:  state.msg });
        chrome.browserAction.setBadgeBackgroundColor({ color:  state.color });
        chrome.browserAction.setTitle({ title : msg +"\n\nRight click for options" });
    }

    function onerror(msg) {
        console.log(msg);
        results.error = msg;
        setState(build.unknown, msg);
    }

    function isSuccess(jobs) {
        return jobs.every(function (job) {
            return successColors.test(job.color);
        });
    }

    function getFailedJobsNames(jobs) {
        return jobs.filter(function (job) {
            return ! successColors.test(job.color);
        }).map(function (job) {
            return job.name;
        });
    }

    function timeout () {
        console.log("timeout");
        if (xhr) {
            xhr.abort();
        }
        newRequest();
    }

    function newRequest() {
        window.setTimeout(start, 60 * 1000 * conf.pollIntervall());
    }

    function start() {
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = onchange;
        xhr.open("GET", conf.apiURL(), true);
        try {
            xhr.send("");
            timeoutId = window.setTimeout(timeout, 10 * 1000);
        } catch (err) {
            console.log(err);
        }
    }

    function onchange () {
        if (xhr.readyState != 4) return;
        results.lastUpdate = new Date();
        console.log("onchange", xhr);
        window.clearTimeout(timeoutId);
        if (xhr.status != 200) {
            onerror("Failed to load data: " + xhr.statusText +  " (" + xhr.status + ")");
        } else {
            display(xhr.responseText);
        }
        newRequest();
    }

    function display(text) {
        try {
            results.hudson = JSON.parse(text);
        } catch (e) {
            onerror("Failed to parse JSON data from " + conf.hudsonUrl() + ": " + e);
            return;
        }
        results.error = undefined;

        if (typeof results.lastJobs !== 'undefined') {
            var changes = getChangedJobs(results.lastJobs, results.hudson.jobs);
            showNotifications(changes);
        }
        results.lastJobs = results.hudson.jobs;

        if (isSuccess(results.hudson.jobs)) {
            setState(build.ok, "Build OK");
        } else {
            var failed_jobs = getFailedJobsNames(results.hudson.jobs);
            setState(
                build.failed, 
                indentLines(
                    getJobsMessages("Failed", failed_jobs),
                    "    "
                ).join("\n")
            );
        }
        if (typeof results.onChange !== 'undefined') {
            results.onChange();
        }
    }
    
    function showNotifications(changes) {
        if (changes.fixed.length) {
            hudson.notifications.showMessages( 
                "green_big.png",
                getJobsMessages("became Stable", changes.fixed)
            );
        }
        if (changes.failed.length) {
            hudson.notifications.showMessages( 
                "red_big.png",
                getJobsMessages("Failed", changes.failed)
            );
        }
    }

    function indentLines(lines, indent) {
        var ignoreFirst = 0;
        return lines.map(function (name) { 
            return (ignoreFirst++ ? indent : "") + name;
        });
    }
    
    function getJobsMessages(verb, jobs) {
        if (1 == jobs.length) {
            return [ "Build \"" + jobs[0] + "\" " + verb + "!" ];
        } else {
            var max_jobs_in_list = 5;
            if (jobs.length > max_jobs_in_list) {
                var not_shown_jobs = (jobs.length - max_jobs_in_list);
                jobs = jobs.slice(0, max_jobs_in_list);
                jobs.push("... " + not_shown_jobs + " more");
            }
            jobs.unshift("Builds " + verb + ":");
            return jobs;
        }
    }
    
    function getChangedJobs(old_jobs, new_jobs) {
        var old_by_status = groupJobsNamesByStatus(old_jobs);
        var new_by_status = groupJobsNamesByStatus(new_jobs);
        var diff_jobs_failed = arraySymmetricDifference(
            old_by_status.failed,
            new_by_status.failed
        );
        return {
            fixed : diff_jobs_failed[0],
            failed : diff_jobs_failed[1]
        };
    }

    function groupJobsNamesByStatus(jobs) {
        var jobs_by_status = {
            ok : [],
            failed : []
        };
        jobs.forEach(function (job) {
            if (successColors.test(job.color)) {
                jobs_by_status.ok.push(job.name);
            } else {
                jobs_by_status.failed.push(job.name);
            }
        });
        return jobs_by_status;
    }
    
    function arraySymmetricDifference(array1, array2) {
        var exists_in = {};
        var exists_only_in_2 = [];
        array1.forEach(function (elem) {
            exists_in[elem] = 1;
        });
        array2.forEach(function (elem) {
            if (elem in exists_in) {
                exists_in[elem] = 2; // exists in both
            } else {
                exists_only_in_2.push(elem);
            }
        });
        var exists_only_in_1 = [];
        for(var elem in exists_in) {
            if (1 === exists_in[elem]) {
                exists_only_in_1.push(elem);
            }
        }
        return [exists_only_in_1, exists_only_in_2];
    }
    
    return function () {
        setState(build.unknown, "Build status unknown");
        start();
        hudson.start = start; /* allowing call from popup */
    };

}(hudson.conf, hudson.results);
