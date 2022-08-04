// This file acts as a template where the contents of other files (mostly JS scripts) can be inserted using <<insert ="file">> (note the double quotes), compiled into bundled_script.js

// register links to watchers for removal / reactivation
var comments_watcher_unbind
var chat_observer
var colorscheme

// get app version
<<insert="appversion.js">>

// global variables
var notificationCounter = 0
var lastNotificationResetTimestamp = Date.now()
const originalDocumentTitle = document.title
if (window.matchMedia) {
    colorscheme = window.matchMedia('(prefers-color-scheme: dark)')
    var current_colorscheme_preference = colorscheme.matches ? "dark" : "light";
}

// insert partial files
<<insert="util.js">>
<<insert="preferences.js">>
<<insert="colormode.js">>
<<insert="notifications.js">>
<<insert="notificationsbadge.js">>
<<insert="css.js">>
<<insert="update.js">>

// check if angular is present before continuing
try { angular; } 
catch(e) {
    if(e.name == "ReferenceError") {
        return;
    }
}

// start
setupColormode()
setupNotifications()
setupPreferencesPane()
addCSS()
setAutoUpdateChecking()
