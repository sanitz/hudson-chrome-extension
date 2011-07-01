hudson.notifications = function(conf) {
    var close_after_seconds = 10,
        notifications = conf.notifications;

    function showMessages(icon, lines) {
        if (notifications()) {
            var notification = webkitNotifications.createNotification(
                icon, 
                lines[0], 
                lines.slice(1).join(", ")
            );
            notification.show();
            window.setTimeout(function() {
                notification.cancel();
            }, close_after_seconds * 1000);
        }
    }

    return {
        showMessages : showMessages,
    };
}(hudson.conf);

