hudson.options = function(conf) {
    var hudsonUrlTextbox, pollIntervallTextbox, saveButton, saveStatus;

    function showSaveStatus(show) {
        saveStatus.style.display = show ? '' : "none";
        saveButton.disabled = show;
    }

    function display() {
        hudsonUrlTextbox.value = conf.hudsonURL();
        pollIntervallTextbox.value = conf.pollIntervall();
        saveButton.disabled = true;
    }

    return { 
        save : function () {
            conf.set({ 
                hudsonURL : hudsonUrlTextbox.value,
                pollIntervall: pollIntervallTextbox.value 
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
            saveButton = document.getElementById("save-button");
            saveStatus = document.getElementById("save-status");
            display();
        }
    };
}(hudson.conf);

