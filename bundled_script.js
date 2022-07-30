// This file acts as a template where the contents of other files (mostly JS scripts) can be inserted using <<insert ="file">> (note the double quotes), compiled into bundled_script.js

// register links to watchers for removal / reactivation
var comments_watcher_unbind
var chat_observer
var colorscheme

// get app version
// Contents Inserted from appversion.js
const appversion = "1.3.1"

// global variables
var notificationCounter = 0
var lastNotificationResetTimestamp = Date.now()
const originalDocumentTitle = document.title
if (window.matchMedia) {
    colorscheme = window.matchMedia('(prefers-color-scheme: dark)')
    var current_colorscheme_preference = colorscheme.matches ? "dark" : "light";
}

// insert partial files
// Contents Inserted from util.js
// This file is not intended to run by itself, but is inserted into main.js

var deepDiffMapper = function () {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: '---',
        map: function (obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                let returnObj = {
                    type: this.compareValues(obj1, obj2),
                    original: obj1,
                    updated: obj2,
                };
                if (returnObj.type != this.VALUE_UNCHANGED) {
                    return returnObj;
                }
                return undefined;
            }

            var diff = {};
            let foundKeys = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                var value2 = undefined;
                if (obj2[key] !== undefined) {
                    value2 = obj2[key];
                }

                let mapValue = this.map(obj1[key], value2);
                foundKeys[key] = true;
                if (mapValue) {
                    diff[key] = mapValue;
                }
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || foundKeys[key] !== undefined) {
                    continue;
                }

                let mapValue = this.map(undefined, obj2[key]);
                if (mapValue) {
                    diff[key] = mapValue;
                }
            }

            //2020-06-13: object length code copied from https://stackoverflow.com/a/13190981/2336212
            if (Object.keys(diff).length > 0) {
                return diff;
            }
            return undefined;
        },
        compareValues: function (value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if (value1 === undefined) {
                return this.VALUE_CREATED;
            }
            if (value2 === undefined) {
                return this.VALUE_DELETED;
            }
            return this.VALUE_UPDATED;
        },
        isFunction: function (x) {
            return Object.prototype.toString.call(x) === '[object Function]';
        },
        isArray: function (x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        },
        isDate: function (x) {
            return Object.prototype.toString.call(x) === '[object Date]';
        },
        isObject: function (x) {
            return Object.prototype.toString.call(x) === '[object Object]';
        },
        isValue: function (x) {
            return !this.isObject(x) && !this.isArray(x);
        }
    }
}();
// Contents Inserted from preferences.js
// This file is not intended to run by itself, but is inserted into main.js

// available themes
overallThemes_dark = {
    'dark': 'Default'
}
overallThemes_light = {
    'light': 'Light',
}
editorThemes_dark = {
    'dracula': 'Dracula',
    'monokai': 'Monokai',
    'cobalt': 'Cobalt',
}
editorThemes_light = {
    'textmate': 'TextMate',
    'overleaf': 'Overleaf',
    'eclipse': 'Eclipse',
}

// user preferences (abbreviated UP)
up_notifications = JSON.parse(localStorage.getItem('notifications')) || true;
up_notifications_comments = JSON.parse(localStorage.getItem('notifications_comment')) || true;
up_notifications_comment_threads = JSON.parse(localStorage.getItem('notifications_comment_response')) || true;
up_notifications_chats = JSON.parse(localStorage.getItem('notifications_chat')) || true;
up_colormode_switching = JSON.parse(localStorage.getItem('colormode_switching')) || true;
up_overalltheme_dark = JSON.parse(localStorage.getItem('overalltheme_dark')) || overallThemes_dark[0];
up_overalltheme_light = JSON.parse(localStorage.getItem('overalltheme_light')) || overallThemes_light[0];
up_editortheme_dark = JSON.parse(localStorage.getItem('editortheme_dark')) || editorThemes_dark[0];
up_editortheme_light = JSON.parse(localStorage.getItem('editortheme_light')) || editorThemes_light[0];

function getFormSelectHTML(category_dicts, category_names) {
    var str = ""
    for (category_index in category_dicts) {
        var endstr = ""
        if (category_names.length - 1 >= category_index) {
            str += `<optgroup label="${category_names[category_index]}">`
            endstr += "</optgroup>"
        }
        category_dict = category_dicts[category_index]
        for (var key in category_dict) {
            val = category_dict[key]
            str += `<option value="${key}">${val}</option>\n`
        }
        str += endstr
    }
    return str
}

// settings menu pane
function setupPreferencesPane() {
    settings_html = `
        <h4>Native Overleaf</h4>
        <div class="containter-fluid">
            <p style="margin: 0">Version ${appversion}</p> 
            <button id="versionlabel" style="margin-bottom: 5px">Check for updates</button>
            <button onClick="window.open('https://github.com/fjwillemsen/NativeOverleaf');">View on GitHub</button>
            <form id="native-overleaf-settings" class="settings">
                <h6>Notifications</h6>
                <label class="settings-toggle">
                    <input id="notifications_chat" class="settings-toggle-checkbox" type="checkbox">
                    <div class="settings-toggle-switch"></div>
                    <span class="settings-toggle-label">Chat messages</span>
                </label>
                <br/>
                <label class="settings-toggle">
                    <input id="notifications_comment" class="settings-toggle-checkbox" type="checkbox">
                    <div class="settings-toggle-switch"></div>
                    <span class="settings-toggle-label">Comments</span>
                </label>
                <br/>
                <label class="settings-toggle">
                    <input id="notifications_comment_response" class="settings-toggle-checkbox" type="checkbox">
                    <div class="settings-toggle-switch"></div>
                    <span class="settings-toggle-label">Comment threads</span>
                </label>
                <hr/>
                <h6>Dark / Light Mode</h6>
                <label class="settings-toggle">
                    <input id="colormode_switching" class="settings-toggle-checkbox" type="checkbox">
                    <div class="settings-toggle-switch"></div>
                    <span class="settings-toggle-label">Follow system</span>
                </label>
                <hr/>
                <b>Dark Mode</b>
                <br/>
                    <label for="overalltheme_dark">Overall</label>
                    <select id="overalltheme_dark">
                        ${getFormSelectHTML([overallThemes_dark, overallThemes_light], ['dark', 'light'])}
                    </select>
                    <br/>
                    <label for="editortheme_dark">Editor</label>
                    <select id="editortheme_dark">
                        ${getFormSelectHTML([editorThemes_dark, editorThemes_light], ['dark', 'light'])}
                    </select>
                <hr/>
                <b>Light Mode</b>
                <br/>
                    <label for="overalltheme_light">Overall</label>
                    <select id="overalltheme_light">
                        ${getFormSelectHTML([overallThemes_light, overallThemes_dark], ['light', 'dark'])}
                    </select>
                    <br/>
                    <label for="editortheme_light">Editor</label>
                    <select id="editortheme_light">
                        ${getFormSelectHTML([editorThemes_light, editorThemes_dark], ['light', 'dark'])}
                    </select>
            </div>
        </form>`;
    if (document.querySelector('#left-menu')) {
        document.querySelector('#left-menu').getElementsByTagName('form')[0].insertAdjacentHTML('afterend', settings_html)
        settings_form = document.querySelector('#native-overleaf-settings')
        // load settings
        settings_form.querySelector('#notifications_chat').checked = up_notifications_chats;
        settings_form.querySelector('#notifications_comment').checked = up_notifications_comments;
        settings_form.querySelector('#notifications_comment_response').checked = up_notifications_comment_threads;
        settings_form.querySelector('#colormode_switching').checked = up_colormode_switching;
        settings_form.querySelector('#overalltheme_dark').value = up_overalltheme_dark;
        settings_form.querySelector('#overalltheme_light').value = up_overalltheme_light;
        settings_form.querySelector('#editortheme_dark').value = up_editortheme_dark;
        settings_form.querySelector('#editortheme_light').value = up_editortheme_light;
        // listen for changes and trigger setting change handlers
        settings_form.addEventListener('change', function() {
            for (var id_key in settings_handler) {
                settings_handler[id_key](id_key, settings_form.querySelector(`#${id_key}`))
            }
        });
    }
}

// setting handlers
var settings_handler = {
    notifications_chat: set_notifications_chat,
    notifications_comment: set_notifications_comment,
    notifications_comment_response: set_notifications_comment_response,
    colormode_switching: set_colormode_switching,
    overalltheme_dark: set_overalltheme_dark,
    overalltheme_light: set_overalltheme_light,
    editortheme_dark: set_editortheme_dark,
    editortheme_light: set_editortheme_light
}

function set_notifications_chat(key, value, _) { 
    if (value != up_notifications_chats) {
        up_notifications_chats = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
        // register the eventlisteners again
        destructNotifications()
        setupNotifications()
    }
};

function set_notifications_comment(key, value, _) { 
    if (value.checked != up_notifications_comments) {
        up_notifications_comments = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
        // register the eventlisteners again
        destructNotifications()
        setupNotifications()
    }
};

function set_notifications_comment_response(key, value, _) { 
    if (value.checked != up_notifications_comment_threads) {
        up_notifications_comment_threads = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
        // register the eventlisteners again
        destructNotifications()
        setupNotifications()
    }
};

function set_colormode_switching(key, value, _) { 
    if (value.checked != up_colormode_switching) {
        up_colormode_switching = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
        settings_form.querySelector('#overalltheme_dark').disabled = !(up_colormode_switching)
        settings_form.querySelector('#overalltheme_light').disabled = !(up_colormode_switching)
        settings_form.querySelector('#editortheme_dark').disabled = !(up_colormode_switching)
        settings_form.querySelector('#editortheme_light').disabled = !(up_colormode_switching)
        if (up_colormode_switching == true) {
            // register the event listener again
            setupColormode()
        } else {
            // remove the event listener
            destructColormode()
        }
    }
};

function themesetter(user_preference_variable_name, key, value) {
    user_preference_variable = eval(user_preference_variable_name)
    localStorage.setItem(key, JSON.stringify(value.value))
    if (value.value != user_preference_variable) {
        // set the "up_.*" variable programmatically because switchColorMode needs it before we can return it
        eval(`${user_preference_variable_name} = "${value.value}"`)
        switchColorMode()
    }
}

function set_overalltheme_dark(key, value) { 
    themesetter("up_overalltheme_dark", key, value)
};

function set_overalltheme_light(key, value) { 
    themesetter("up_overalltheme_light", key, value)
};

function set_editortheme_dark(key, value) { 
    themesetter("up_editortheme_dark", key, value)
};

function set_editortheme_light(key, value) { 
    themesetter("up_editortheme_light", key, value)
};
// Contents Inserted from colormode.js
// This file is not intended to run by itself, but is inserted into main.js

// Overleaf has weird designators for the overall theme, so we use more descriptive ones internally
var overallThemeToOverleaf = {
    'dark': '',
    'light': 'light-'
}

function switchColorMode() {
    scope = angular.element('[ng-controller=SettingsController]').scope();
    if (scope) {
        if (current_colorscheme_preference == 'dark') {
            scope.settings["overallTheme"] = overallThemeToOverleaf[up_overalltheme_dark]
            scope.settings["editorTheme"] = up_editortheme_dark
        } else if(current_colorscheme_preference == 'light') {
            scope.settings["overallTheme"] = overallThemeToOverleaf[up_overalltheme_light]
            scope.settings["editorTheme"] = up_editortheme_light
        } else {
            console.err(`current colorscheme preference ${current_colorscheme_preference} is not a valid value`)
        }
        scope.$apply();
    }
}

// setup colormode
function autoChangeColorMode(event) {
    current_colorscheme_preference = event.matches ? "dark" : "light";
    switchColorMode()
} 
function setupColormode() {
    if (colorscheme !== undefined && up_colormode_switching == true) {
        switchColorMode()
        // if the colorscheme changes
        colorscheme.addEventListener('change', autoChangeColorMode, true);
    }
}
function destructColormode() {
    if (colorscheme !== undefined && up_colormode_switching == false) {
        colorscheme.removeEventListener('change', autoChangeColorMode, true);
    }
}
// Contents Inserted from notifications.js
// This file is not intended to run by itself, but is inserted into main.js

function sendNotification(text) {
    new Notification(`${text}`);
    updateCounter(1);
}

// setup notifications
function setupNotifications() {
    // first check if notifications are used at all before setting up
    const any_notifications_used = up_notifications_chats == true || up_notifications_comments == true || up_notifications_comment_threads == true
    if (up_notifications == true && any_notifications_used == true) {
        // check if browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support notifications");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            // sendNotification("Notifications are enabled");
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    sendNotification("Notifications are now enabled");
                }
            });
        }

        // reset notifications if the window is in focus
        addEventListener('focus', resetCounter);
        
        // set watch on comment threads
        if (up_notifications_comments == true) {
            comments_scope = angular.element('[ng-controller=ReviewPanelController]').scope();
            // if the ReviewPanelController is in scope, set a watcher
            if (comments_scope) {
                // if there are new comments, find the new ones and emit a notification for it
                if (comments_watcher_unbind !== undefined) {
                    throw "comments_watcher_unbind should be undefined at this point"
                }
                comments_watcher_unbind = comments_scope.$watch('reviewPanel.commentThreads', function(newVal, oldVal) {
                    diffs = deepDiffMapper.map(oldVal, newVal)
                    for (const diff_key in diffs) {
                        // unpack payload
                        var payload = diffs[diff_key]

                        // when a comment is resolved
                        if (payload.resolved && payload.resolved_at && payload.resolved_by_user) {
                            user = payload.resolved_by_user.updated
                            // check if this is newer than the last reset and if the user did not do it themselves 
                            if (new Date(payload.resolved_at.updated) > lastNotificationResetTimestamp && !(user.isSelf)) {
                                sendNotification(`${user.name} resolved a comment`)
                            }
                        }

                        // new comment threads and new comments in a thread use the same structure
                        var actionText = "responded to a comment"
                        if (payload.updated) {
                            payload = payload.updated
                            actionText = "commented"
                        }
                        messages = payload.messages
                        for (const message_index in messages) {
                            // unpack message
                            var message = messages[message_index]
                            if (message.updated) {
                                message = message.updated
                                // if notifications of comment threads are not enabled, skip this message   (TODO check if it is safe to break here?)
                                if (!(up_notifications_comment_threads)) {
                                    continue;
                                }
                            }
                            // check if message was sent after latest timestamp, it is not a self-comment and the contents exist
                            if (message.timestamp > lastNotificationResetTimestamp && message.user && message.content && !(message.user.isSelf)) {
                                sendNotification(`${message.user.name} ${actionText}: ${message.content}`)
                            }
                        }
                    }
                }, true);
            }
        }

        // set watch on chat
        if (up_notifications_chats == true) {
            chat_scope = angular.element('[class="infinite-scroll messages"]').children().children()
            if (chat_scope && chat_scope.length && chat_scope[1]) {
                if (chat_observer === undefined) {
                    chat_observer = new MutationObserver(function(mutations) {
                        if (mutations.length) {
                            mutations = mutations[mutations.length - 1]
                        }
                        // only continue if the mutation was at least two seconds after last reset to avoid sending historical chats
                        if (Date.now() > lastNotificationResetTimestamp + (2*1000)) {
                            for (const message_index in mutations.addedNodes) {
                                message = mutations.addedNodes[message_index]
                                if (message.getElementsByClassName) {
                                    wrapper = message.getElementsByClassName("message-wrapper")[0]
                                    // there is only a name if the sender is not self
                                    if (wrapper.getElementsByClassName('name').length) {
                                        sendername = wrapper.getElementsByClassName('name')[0].getElementsByTagName('span')[0].innerHTML
                                        contents = wrapper.getElementsByClassName('message')[0].getElementsByClassName('message-content')
                                        last_texts = contents[contents.length - 1].getElementsByTagName('p')
                                        last_text = last_texts[last_texts.length - 1].innerHTML
                                        sendNotification(`${sendername} in chat: ${last_text}`)
                                    }
                                }
                            }
                        }
                    });
                }
                chat_observer.observe(chat_scope[1], {
                    childList: true,
                    subtree: true
                })
            }
        }
    }
}

function destructNotifications() {
    if (comments_watcher_unbind !== undefined) {
        comments_watcher_unbind()
        comments_watcher_unbind = undefined
    }
    if (chat_observer !== undefined) {
        chat_observer.disconnect()
    }
    removeEventListener('focus', resetCounter)
}
// Contents Inserted from notificationsbadge.js
// This file is not intended to run by itself, but is inserted into main.js

// prevent the document (window) title from being overwritten by Overleaf when a new message comes in
Object.defineProperty(document, 'title', {
    set: function (newValue) {
        if(newValue != "" && newValue != "New Message"){
            document.getElementsByTagName("title")[0].innerHTML = newValue;
        }
    },
});

// update the counter by setting the window title to "(counter) "
function updateCounter(countToAdd) {
    notificationCounter += countToAdd
    if (notificationCounter <= 0) {
        return resetCounter()
    }
    const replaceOldCounter = /^(\(\d*\))\W/
    // test if there is a counter to be replaced
    if (replaceOldCounter.test(document.title)) {
        document.title = document.title.replace(replaceOldCounter, `(${notificationCounter}) `)
    }
    else {
        document.title = `(${notificationCounter}) ${originalDocumentTitle}`
    }
}

function resetCounter(event) {
    notificationCounter = 0
    document.title = originalDocumentTitle
    lastNotificationResetTimestamp = Date.now()
}
// Contents Inserted from css.js
// This file is not intended to run by itself, but is inserted into main.js

// inserting CSS
function addCSS() {
    const css_text = `
        .native-overleaf-settings {
            display: inline-block;
            width: 260px;
        }

        .settings-toggle {
            cursor: pointer;
            display: inline-block;
        }
        .settings-toggle-switch {
            display: inline-block;
            background: #2e3644;
            border-radius: 16px;
            width: 58px;
            height: 32px;
            position: relative;
            vertical-align: middle;
            transition: background 0.25s;
        }
        .settings-toggle-switch:before, .settings-toggle-switch:after {
            content: "";
        }
        .settings-toggle-switch:before {
            display: block;
            background: linear-gradient(to bottom, #fff 0%, #eee 100%);
            border-radius: 50%;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
            width: 24px;
            height: 24px;
            position: absolute;
            top: 4px;
            left: 4px;
            transition: left 0.25s;
        }
        .settings-toggle:hover .settings-toggle-switch:before {
            background: linear-gradient(to bottom, #fff 0%, #fff 100%);
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
        }
        .settings-toggle-checkbox:checked + .settings-toggle-switch {
            background: #408827;
        }
        .settings-toggle-checkbox:checked + .settings-toggle-switch:before {
            left: 30px;
        }
        .settings-toggle-checkbox {
            position: absolute;
            visibility: hidden;
        }
        .settings-toggle-label {
            margin-left: 5px;
            position: relative;
            top: 2px;
        }
    `;
    var styleSheet = document.createElement("style")
    styleSheet.innerText = css_text
    document.head.appendChild(styleSheet)
}// Contents Inserted from update.js
// This file is not intended to run by itself, but is inserted into main.js

async function fetchAsync(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

function semanticVersionCompare(a, b) {
    // from https://gist.github.com/iwill/a83038623ba4fef6abb9efca87ae9ccb
    if (a.startsWith(b + "-")) return -1
    if (b.startsWith(a + "-")) return  1
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "case", caseFirst: "upper" })
}

async function checkForUpdate(reportAll = false) {
    tags = await fetchAsync("https://api.github.com/repos/fjwillemsen/NativeOverleaf/tags")
    if (!(tags.length) || tags.length === undefined) {
        console.error("Can not retrieve latest version for update checking")
        return
    }
    latest_version = tags[0].name.replace('v', '')
    comparison = semanticVersionCompare(latest_version, appversion)
    if (comparison == 0 && comparison !== "") {
        console.log("Update check completed, no update available.")
        if (reportAll == true) {
            alert("You're up to date with the latest version!")
        }
    } else if (comparison == 1) {
        goToUpdate = confirm(`Update available! 
            Current: ${appversion}, latest: ${latest_version}.
            Go to downloads page?`)
        if (goToUpdate) {
            window.open("https://github.com/fjwillemsen/NativeOverleaf/releases/tag/v1.2.0")
        }
    } else if (comparison == -1) {
        result = `No update needed, current version (${appversion}) is newer than latest publicly available version (${latest_version}).`
        console.log(result)
        if (reportAll == true) {
            alert(result)
        }
    } else {
        result = `Invalid semantic version comparison outcome: ${comparison}`
        console.log(result)
        if (reportAll == true) {
            alert(result)
        }
    }
}

function setAutoUpdateChecking() {
    // check for updates straight away
    checkForUpdate()
    // check for updates every six hours
    setInterval(checkForUpdate, 6*60*60*1000);
    // trigger the check update function when the version label is clicked
    if (document.querySelector('#versionlabel')) {
        document.querySelector('#versionlabel').onclick = function(){ checkForUpdate(true) }
    }
}

// start
setupColormode()
setupNotifications()
setupPreferencesPane()
addCSS()
setAutoUpdateChecking()
