hudson.options = function(conf) {
    var hudsonUrlTextbox, pollIntervallTextbox, notificationsCheckbox, saveButton, saveStatus;

    function showSaveStatus(show) {
        saveStatus.style.display = show ? '' : "none";
        saveButton.disabled = show;
    }

    function display() {
        hudsonUrlTextbox.value = conf.hudsonURL();
        pollIntervallTextbox.value = conf.pollIntervall();
        notificationsCheckbox.checked = conf.notifications();
        saveButton.disabled = true;
    }

    return { 
        save : function () {
            conf.set({ 
                hudsonURL : hudsonUrlTextbox.value,
                pollIntervall: pollIntervallTextbox.value,
                notifications: notificationsCheckbox.checked
            });
            showSaveStatus(true);
            display();
            chrome.extension.getBackgroundPage().hudson.init();
        },

        markDirty : function () {
            showSaveStatus(false)
        },

        init : function () {
            hudsonUrlTextbox = document.getElementById("hudson-url"), 
            pollIntervallTextbox = document.getElementById("poll-intervall"), 
            notificationsCheckbox = document.getElementById("desktop-notifications"), 
            saveButton = document.getElementById("save-button");
            saveStatus = document.getElementById("save-status");
            display();
        }
    };
}(hudson.conf);

//set event handlers
window.onload = setEventHandlers;
function setEventHandlers(){
    document.getElementById("hudson-url").oninput = hudson.options.markDirty;
    document.getElementById("desktop-notifications").onchange = hudson.options.markDirty;
    document.getElementById("poll-intervall").oninput = hudson.options.markDirty;
    document.getElementById("save-button").onclick = hudson.options.save;
    document.getElementById("cancel-button").onclick = hudson.options.save;
    hudson.options.init();
}
