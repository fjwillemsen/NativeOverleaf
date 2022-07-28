// This file acts as a template where the contents of other files (mostly JS scripts) can be inserted using <<insert ="file">> (note the double quotes), compiled into bundled_script.js

// available themes
editorThemes_light = ['textmate', 'overleaf', 'eclipse']
editorThemes_dark = ['dracula', 'monokai', 'cobalt']
overallThemes_light = ['light-']
overallThemes_dark = ['']

// user preferences
up_notifications = JSON.parse(localStorage.getItem('notifications')) || true;
up_notifications_comments = JSON.parse(localStorage.getItem('notifications_comment')) || true;
up_notifications_comment_threads = JSON.parse(localStorage.getItem('notifications_comment_response')) || true;
up_notifications_chats = JSON.parse(localStorage.getItem('notifications_chat')) || true;
up_colormode_switching = JSON.parse(localStorage.getItem('colormode_switching')) || true;
up_editortheme_dark = JSON.parse(localStorage.getItem('editortheme_dark')) || editorThemes_dark[0];
up_editortheme_light = JSON.parse(localStorage.getItem('editortheme_light')) || editorThemes_light[0];

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
<<insert="colormode.js">>
<<insert="notifications.js">>
<<insert="notificationsbadge.js">>
<<insert="preferences.js">>
<<insert="css.js">>
<<insert="update.js">>

// start
setupColormode()
setupNotifications()
setupPreferencesPane()
addCSS()
setAutoUpdateChecking()
