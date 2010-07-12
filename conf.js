var hudson = hudson || {};
hudson.conf = function () {
    var default_url = "http://ci.hudson-labs.org/",
        default_pollIntervall = 10;

    function setPollIntervall(minutes) {
            var pollIntervall = parseInt(minutes);
            if (0 < pollIntervall && pollIntervall < (24 * 60)) { 
                localStorage.pollIntervall = pollIntervall;
            }
    }

    function setHudsonURL(url) {
        var slash = '/';
        if (slash !== url.substr( url.length  - slash.length, slash.length ) ) {
            url = url + slash;
        }
        localStorage.hudsonUrl = url;
    }

    function get(name, defaultValue) {
        return function() {
            if (localStorage[name]) {
                return localStorage[name];
            }
            return defaultValue;
        }
    }

    return {
        pollIntervall : get('pollIntervall', default_pollIntervall),
        hudsonURL : get('hudsonUrl', default_url), 
        set : function (values) {
            setPollIntervall(values.pollIntervall);
            setHudsonURL(values.hudsonURL);
        },
        apiURL : function() {
            return this.hudsonURL() + "api/json/";
        }
    }
}();

