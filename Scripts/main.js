// This file acts as a template where the contents of other files (mostly JS scripts) can be inserted using <<insert ="file">> (note the double quotes), compiled into bundled_script.js

// register links to watchers for removal / reactivation
let comments_watcher_unbind;
let changes_watcher_unbind;
let chat_observer;
let compilation_observer;
let pdf_change_observer;
let colorscheme;

// set whether external libraries are loaded
let lib_chartjs_loaded = false;

// get app version
<<insert="appversion.js">>

// check if angular is present before continuing
try { angular; } 
catch(e) {
    if(e.name == "ReferenceError") {
        throw new Error("Angular is not present on this page, Native Overleaf will not be active here");
    }
}

// global variables
let notificationCounter = 0
let lastNotificationResetTimestamp = Date.now()
let lastChangeNotificationTimestamp = Date.now()
const originalDocumentTitle = document.title
let current_colorscheme_preference;
if (window.matchMedia) {
    colorscheme = window.matchMedia('(prefers-color-scheme: dark)')
    current_colorscheme_preference = colorscheme.matches ? "dark" : "light";
}

// insert partial files
<<insert="util.js">>
<<insert="preferences.js">>
<<insert="colormode.js">>
<<insert="notifications.js">>
<<insert="notificationsbadge.js">>
<<insert="css.js">>
<<insert="update.js">>
<<insert="wordcount.js">>
<<insert="backup.js">>
<<insert="chart.js">>

// start
const startTime = performance.now();
setupColormode()
setupNotifications()
setupPreferencesPane()
addCSS()
setAutoUpdateChecking()
setupWordCount()
// setupBackup()
const endTime = performance.now();
console.log(`Native Overleaf injected setup took ${endTime - startTime} milliseconds`);
