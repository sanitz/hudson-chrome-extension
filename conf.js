var hudson = hudson || {};
hudson.conf = function () {
    var default_url = "http://ci.hudson-labs.org/",
        default_pollIntervall = 10,
        default_notifications = true;

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

    function setNotificationsEnabled(enabled) {
        localStorage.notifications = enabled;
    }

    function get(name, defaultValue) {
        return function() {
            if (localStorage[name]) {
                return localStorage[name];
            }
            return defaultValue;
        }
    }

    function getBoolean(name, defaultValue) {
        return function() {
            return get(name, defaultValue)() === 'true';
        }
    }
    
    return {
        pollIntervall : get('pollIntervall', default_pollIntervall),
        hudsonURL : get('hudsonUrl', default_url), 
        notifications : getBoolean('notifications', default_notifications),
        set : function (values) {
            setPollIntervall(values.pollIntervall);
            setHudsonURL(values.hudsonURL);
            setNotificationsEnabled(values.notifications);
        },
        apiURL : function() {
            return this.hudsonURL() + "api/json/";
        }
    }
}();

