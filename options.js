var hudsonUrlTextbox;
var saveButton;

init();

function init() {
    hudsonUrlTextbox = document.getElementById("hudson-url");
    saveButton = document.getElementById("save-button");
    hudsonUrlTextbox.value = localStorage.hudsonUrl || "";
    markClean();
}

function save() {
    localStorage.hudsonUrl = hudsonUrlTextbox.value;
    markClean();
    chrome.extension.getBackgroundPage().init();
}

function markDirty() {
    saveButton.disabled = false;
}

function markClean() {
    saveButton.disabled = true;
}

