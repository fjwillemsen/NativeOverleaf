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

console.log(up_colormode_switching)

// global variables
var notificationCounter = 0
var lastNotificationResetTimestamp = Date.now()
const originalDocumentTitle = document.title
if (window.matchMedia) {
    var current_colorscheme_preference = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
}

// prevent the document (window) title from being overwritten by Overleaf when a new message comes in
Object.defineProperty(document, 'title', {
    set: function (newValue) {
        if(newValue != "" && newValue != "New Message"){
            document.getElementsByTagName("title")[0].innerHTML = newValue;
        }
    },
});

// start setup
setupColormode()
setupNotifications()


function switchColorMode() {
    scope = angular.element('[ng-controller=SettingsController]').scope();
    if (scope) {
        if (current_colorscheme_preference == 'dark') {
            scope.settings["overallTheme"] = overallThemes_dark[0]
            scope.settings["editorTheme"] = up_editortheme_dark
        } else if(current_colorscheme_preference == 'light') {
            scope.settings["overallTheme"] = overallThemes_light[0]
            scope.settings["editorTheme"] = up_editortheme_light
        } else {
            throw `current colorscheme preference ${current_colorscheme_preference} is not a valid value`
        }
        scope.$apply();
    }
}

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

function resetCounter() {
    notificationCounter = 0
    document.title = originalDocumentTitle
    lastNotificationResetTimestamp = Date.now()
}

function sendNotification(text) {
    new Notification(`${text}`);
    updateCounter(1);
}

// setup colormode
function setupColormode() {
    if (window.matchMedia && up_colormode_switching == true) {
        switchColorMode()
        var colorscheme = window.matchMedia('(prefers-color-scheme: dark)')
        // if the colorscheme changes
        colorscheme.addEventListener('change', event => {
            current_colorscheme_preference = event.matches ? "dark" : "light";
            switchColorMode()
        });
        // // if the URL changes
        // // not necessary because this script is executed on each new page
        // window.addEventListener('popstate', function() { 
        //     console.log(window.location.pathname)
        // });
    }
}

// setup notifications
function setupNotifications() {
    if (up_notifications == true) {
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
        addEventListener('focus', (event) => {
            resetCounter()
        });
        
        // set watch on comment threads
        if (up_notifications_comments == true) {
            comments_scope = angular.element('[ng-controller=ReviewPanelController]').scope();
            // if the ReviewPanelController is in scope, set a watcher
            if (comments_scope) {
                // if there are new comments, find the new ones and emit a notification for it
                comments_scope.$watch('reviewPanel.commentThreads', function(newVal, oldVal) {
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
                observer = new MutationObserver(function(mutations) {
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
                observer.observe(chat_scope[1], {
                    childList: true,
                    subtree: true
                })
            }
        }
    }
}

function getThemesHTML(array) {
    var str = ""
    for (const index in array) {
        val = array[index]
        str += `<option value="${val}">${val}</option>\n`
    }
    return str
}

// settings menu pane
settings_html = `
    <h4>Native Overleaf</h4>
    <div class="containter-fluid">
        <p>View <a href="https://github.com/fjwillemsen/NativeOverleaf">Native Overleaf on GitHub</a></p>
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
            <br/>
            <label for="editortheme_light">Editor light mode</label>
            <select id="editortheme_light">
                ${getThemesHTML(editorThemes_light)}
            </select>
            <label for="editortheme_dark">Editor dark mode</label>
            <select id="editortheme_dark">
                ${getThemesHTML(editorThemes_dark)}
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
    settings_form.querySelector('#editortheme_dark').value = up_editortheme_dark;
    settings_form.querySelector('#editortheme_light').value = up_editortheme_light;
    // listen for changes and trigger setting change handlers
    settings_form.addEventListener('change', function() {
        for (var id_key in settings_handler) {
            settings_handler[id_key](id_key, settings_form.querySelector(`#${id_key}`))
        }
    });
}

// setting handlers
var settings_handler = {
    notifications_chat: set_notifications_chat,
    notifications_comment: set_notifications_comment,
    notifications_comment_response: set_notifications_comment_response,
    colormode_switching: set_colormode_switching,
    editortheme_dark: set_editortheme_dark,
    editortheme_light: set_editortheme_light
}

function set_notifications_chat(key, value, _) { 
    if (value != up_notifications_chats) {
        up_notifications_chats = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
    }
};

function set_notifications_comment(key, value, _) { 
    if (value.checked != up_notifications_comments) {
        up_notifications_comments = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
    }
};

function set_notifications_comment_response(key, value, _) { 
    if (value.checked != up_notifications_comment_threads) {
        up_notifications_comment_threads = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
    }
};

function set_colormode_switching(key, value, _) { 
    if (value.checked != up_colormode_switching) {
        up_colormode_switching = value.checked
        localStorage.setItem(key, JSON.stringify(value.checked))
        settings_form.querySelector('#editortheme_dark').disabled = !(up_colormode_switching)
        settings_form.querySelector('#editortheme_light').disabled = !(up_colormode_switching)
    }
};

function set_editortheme_dark(key, value) { 
    if (value.value != up_editortheme_dark) {
        up_editortheme_dark = value.value
        localStorage.setItem(key, JSON.stringify(value.value))
        switchColorMode()
    }
};

function set_editortheme_light(key, value) { 
    if (value.value != up_editortheme_light) {
        up_editortheme_light = value.value
        localStorage.setItem(key, JSON.stringify(value.value))
        switchColorMode()
    }
};


// inserting CSS
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



// Utility functions


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
