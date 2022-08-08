// This file is not intended to run by itself, but is inserted into main.js

// prevent the document (window) title from being overwritten by Overleaf when a new message comes in
Object.defineProperty(document, "title", {
    set: function (newValue) {
        if (newValue != "" && newValue != "New Message") {
            document.getElementsByTagName("title")[0].innerHTML = newValue;
        }
    },
});

// update the counter by setting the window title to "(counter) "
function updateCounter(countToAdd) {
    notificationCounter += countToAdd;
    if (notificationCounter <= 0) {
        return resetCounter();
    }
    const replaceOldCounter = /^(\(\d*\))\W/;
    // test if there is a counter to be replaced
    if (replaceOldCounter.test(document.title)) {
        document.title = document.title.replace(replaceOldCounter, `(${notificationCounter}) `);
    } else {
        document.title = `(${notificationCounter}) ${originalDocumentTitle}`;
    }
}

function resetCounter(event) {
    notificationCounter = 0;
    document.title = originalDocumentTitle;
    lastNotificationResetTimestamp = Date.now();
}
