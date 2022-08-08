// This file acts as a template where the contents of other files (mostly JS scripts) can be inserted using <<insert ="file">> (note the double quotes), compiled into bundled_script.js

// register links to watchers for removal / reactivation
var comments_watcher_unbind
var chat_observer
var colorscheme

// get app version
// Contents Inserted from appversion.js
const appversion = "1.4.0";

// check if angular is present before continuing
try { angular; } 
catch(e) {
    if(e.name == "ReferenceError") {
        return;
    }
}

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

// extensions for saving and retrieving objects in localstorage
Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
};
Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

// function that returns the current local date of the user as a "YYYY-MM-DD" formatted string
function getLocalDate() {
    return new Date().toLocaleDateString("en-CA");
}

// function that checks a function returning a boolean and backs off for waitTime duration if it is not yet true, maximum numberOfTimesToCheck times
function recursiveCheckAndWait(
    checkFunction,
    waitTime,
    numberOfTimesToCheck,
    multiplyWaitTime = false,
    numberOfTimesChecked = 0
) {
    checkFunctionResult = checkFunction();
    numberOfTimesChecked += 1;
    if (checkFunctionResult != false) {
        // if the function does not return false, return its value
        return checkFunctionResult;
    } else if (numberOfTimesToCheck - numberOfTimesChecked <= 0) {
        // if we have ran out of checks, return false
        return false;
    } else {
        // else create a new timeout to check again after the waitTime
        return new Promise((resolve) => {
            if (multiplyWaitTime == true) {
                // be aware that the waittime is passed as an argument and multiplied each time, so waitTime=500 and numberOfTimesToCheck=5 goes like: 0 (first is immediately), 500*1, 500*2, (500*2)*3, ((500*2)*3)*4
                waitTime = waitTime * numberOfTimesChecked;
            }
            setTimeout(() => {
                resolve(
                    recursiveCheckAndWait(
                        checkFunction,
                        waitTime,
                        numberOfTimesToCheck,
                        multiplyWaitTime,
                        numberOfTimesChecked
                    )
                );
            }, waitTime);
        });
    }
}

// function for mapping the difference between two objects
var deepDiffMapper = (function () {
    return {
        VALUE_CREATED: "created",
        VALUE_UPDATED: "updated",
        VALUE_DELETED: "deleted",
        VALUE_UNCHANGED: "---",
        map: function (obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw "Invalid argument. Function given, object expected.";
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
            return Object.prototype.toString.call(x) === "[object Function]";
        },
        isArray: function (x) {
            return Object.prototype.toString.call(x) === "[object Array]";
        },
        isDate: function (x) {
            return Object.prototype.toString.call(x) === "[object Date]";
        },
        isObject: function (x) {
            return Object.prototype.toString.call(x) === "[object Object]";
        },
        isValue: function (x) {
            return !this.isObject(x) && !this.isArray(x);
        },
    };
})();
// Contents Inserted from preferences.js
// This file is not intended to run by itself, but is inserted into main.js

// available themes
const overallThemes_dark = {
    dark: "Default",
};
const overallThemes_light = {
    light: "Light",
};
const editorThemes_dark = {
    dracula: "Dracula",
    monokai: "Monokai",
    cobalt: "Cobalt",
};
const editorThemes_light = {
    textmate: "TextMate",
    overleaf: "Overleaf",
    eclipse: "Eclipse",
};

// user preferences (abbreviated UP)
let up_notifications = localStorage.getObject("notifications") || true;
let up_notifications_comments = localStorage.getObject("notifications_comment") || true;
let up_notifications_comment_threads = localStorage.getObject("up_notifications_comment_response") || true;
let up_notifications_chats = localStorage.getObject("notifications_chat") || true;
let up_colormode_switching = localStorage.getObject("colormode_switching") || true;
let up_overalltheme_dark = localStorage.getObject("overalltheme_dark") || overallThemes_dark[0];
let up_overalltheme_light = localStorage.getObject("overalltheme_light") || overallThemes_light[0];
let up_editortheme_dark = localStorage.getObject("editortheme_dark") || editorThemes_dark[0];
let up_editortheme_light = localStorage.getObject("editortheme_light") || editorThemes_light[0];
let up_wordcount_tracking = localStorage.getObject("wordcount_tracking") || true; // whether wordcount tracking is enabled
let up_wordcount_interval = localStorage.getObject("wordcount_interval") || 15; // interval to check on the wordcount in minutes
let up_wordcount_dailytarget = localStorage.getObject("wordcount_dailytarget") || 200; // net number of words that must be produced daily
let up_wordcount_notificationhour = localStorage.getObject("wordcount_notificationhour") || 18; // hour of the day at which the user is notified whether they have achieved their goal

function getFormSelectHTML(category_dicts, category_names) {
    var str = "";
    for (category_index in category_dicts) {
        var endstr = "";
        if (category_names.length - 1 >= category_index) {
            str += `<optgroup label="${category_names[category_index]}">`;
            endstr += "</optgroup>";
        }
        category_dict = category_dicts[category_index];
        for (var key in category_dict) {
            val = category_dict[key];
            str += `<option value="${key}">${val}</option>\n`;
        }
        str += endstr;
    }
    return str;
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
                            ${getFormSelectHTML([overallThemes_dark, overallThemes_light], ["dark", "light"])}
                        </select>
                        <br/>
                        <label for="editortheme_dark">Editor</label>
                        <select id="editortheme_dark">
                            ${getFormSelectHTML([editorThemes_dark, editorThemes_light], ["dark", "light"])}
                        </select>
                    <hr/>
                    <b>Light Mode</b>
                    <br/>
                        <label for="overalltheme_light">Overall</label>
                        <select id="overalltheme_light">
                            ${getFormSelectHTML([overallThemes_light, overallThemes_dark], ["light", "dark"])}
                        </select>
                        <br/>
                        <label for="editortheme_light">Editor</label>
                        <select id="editortheme_light">
                            ${getFormSelectHTML([editorThemes_light, editorThemes_dark], ["light", "dark"])}
                        </select>
                <hr/>
                <h6>Wordcount Tracking</h6>
                    <label class="settings-toggle">
                        <input id="wordcount_tracking" class="settings-toggle-checkbox" type="checkbox">
                        <div class="settings-toggle-switch"></div>
                        <span class="settings-toggle-label">Tracking</span>
                    </label>
                    <br/>
                    <label for="wordcount_interval">Checking interval in minutes:</label>
                    <input type="number" id="wordcount_interval" min="1" max="1000">
                    <br/>
                    <label for="wordcount_dailytarget">Daily number of words target:</label>
                    <input type="number" id="wordcount_dailytarget" min="0">
                    <br/>
                    <label for="wordcount_notificationhour">Hour of daily notification<br/><i>(0 to 23, empty means no notification)</i>:</label>
                    <input type="number" id="wordcount_notificationhour" min="0" max="23">
            </div>
        </form>`;
    if (document.querySelector("#left-menu")) {
        // insert the HTML code
        document
            .querySelector("#left-menu")
            .getElementsByTagName("form")[0]
            .insertAdjacentHTML("afterend", settings_html);

        // set the settings to their current values
        settings_form = document.querySelector("#native-overleaf-settings");
        settings_form.querySelector("#notifications_chat").checked = up_notifications_chats;
        settings_form.querySelector("#notifications_comment").checked = up_notifications_comments;
        settings_form.querySelector("#notifications_comment_response").checked = up_notifications_comment_threads;
        settings_form.querySelector("#colormode_switching").checked = up_colormode_switching;
        settings_form.querySelector("#overalltheme_dark").value = up_overalltheme_dark;
        settings_form.querySelector("#overalltheme_light").value = up_overalltheme_light;
        settings_form.querySelector("#editortheme_dark").value = up_editortheme_dark;
        settings_form.querySelector("#editortheme_light").value = up_editortheme_light;
        settings_form.querySelector("#wordcount_tracking").checked = up_wordcount_tracking;
        settings_form.querySelector("#wordcount_interval").value = up_wordcount_interval;
        settings_form.querySelector("#wordcount_dailytarget").value = up_wordcount_dailytarget;
        settings_form.querySelector("#wordcount_notificationhour").value = up_wordcount_notificationhour;

        // listen for changes and trigger setting change handlers
        settings_form.addEventListener("change", function () {
            for (var id_key in settings_handler) {
                settings_handler[id_key](id_key, settings_form.querySelector(`#${id_key}`));
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
    editortheme_light: set_editortheme_light,
    wordcount_tracking: set_wordcount_tracking,
    wordcount_interval: set_wordcount_interval,
    wordcount_dailytarget: set_wordcount_dailytarget,
    wordcount_notificationhour: set_wordcount_notificationhour,
};

function set_wordcount_tracking(key, value) {
    console.log(key, value);
    if (value.checked != up_wordcount_tracking) {
        up_wordcount_tracking = value.checked;
        settings_form.querySelector("#wordcount_interval").disabled = !up_wordcount_tracking;
        settings_form.querySelector("#wordcount_dailytarget").disabled = !up_wordcount_tracking;
        settings_form.querySelector("#wordcount_notificationhour").disabled = !up_wordcount_tracking;
        if (up_wordcount_tracking == true) {
            // register the wordcount tracking again
            setupWordCount();
        } else {
            // remove the interval
            destructWordCount();
        }
    }
}

function set_wordcount_interval(key, value) {
    console.log(key, value);
    if (value.value != up_wordcount_interval) {
        up_wordcount_interval = value.value;
        // register the wordcount tracking again so the new interval is used
        destructWordCount();
        setupWordCount();
    }
}

function set_wordcount_dailytarget(key, value) {
    console.log(key, value);
    if (value.value != up_wordcount_dailytarget) {
    }
}

function set_wordcount_notificationhour(key, value) {
    console.log(key, value);
    if (value.value != up_wordcount_notificationhour) {
    }
}

function set_notifications_chat(key, value) {
    if (value != up_notifications_chats) {
        up_notifications_chats = value.checked;
        localStorage.setObject(key, value.checked);
        // register the eventlisteners again
        destructNotifications();
        setupNotifications();
    }
}

function set_notifications_comment(key, value) {
    if (value.checked != up_notifications_comments) {
        up_notifications_comments = value.checked;
        localStorage.setObject(key, value.checked);
        // register the eventlisteners again
        destructNotifications();
        setupNotifications();
    }
}

function set_notifications_comment_response(key, value) {
    if (value.checked != up_notifications_comment_threads) {
        up_notifications_comment_threads = value.checked;
        localStorage.setObject(key, value.checked);
        // register the eventlisteners again
        destructNotifications();
        setupNotifications();
    }
}

function set_colormode_switching(key, value) {
    if (value.checked != up_colormode_switching) {
        up_colormode_switching = value.checked;
        localStorage.setObject(key, value.checked);
        settings_form.querySelector("#overalltheme_dark").disabled = !up_colormode_switching;
        settings_form.querySelector("#overalltheme_light").disabled = !up_colormode_switching;
        settings_form.querySelector("#editortheme_dark").disabled = !up_colormode_switching;
        settings_form.querySelector("#editortheme_light").disabled = !up_colormode_switching;
        if (up_colormode_switching == true) {
            // register the event listener again
            setupColormode();
        } else {
            // remove the event listener
            destructColormode();
        }
    }
}

function themesetter(user_preference_variable_name, key, value) {
    user_preference_variable = eval(user_preference_variable_name);
    localStorage.setObject(key, value.value);
    if (value.value != user_preference_variable) {
        // set the "up_.*" variable programmatically because switchColorMode needs it before we can return it
        eval(`${user_preference_variable_name} = "${value.value}"`);
        switchColorMode();
    }
}

function set_overalltheme_dark(key, value) {
    themesetter("up_overalltheme_dark", key, value);
}

function set_overalltheme_light(key, value) {
    themesetter("up_overalltheme_light", key, value);
}

function set_editortheme_dark(key, value) {
    themesetter("up_editortheme_dark", key, value);
}

function set_editortheme_light(key, value) {
    themesetter("up_editortheme_light", key, value);
}
// Contents Inserted from colormode.js
// This file is not intended to run by itself, but is inserted into main.js

// Overleaf has weird designators for the overall theme, so we use more descriptive ones internally
var overallThemeToOverleaf = {
    dark: "",
    light: "light-",
};

function switchColorMode() {
    scope = angular.element("[ng-controller=SettingsController]").scope();
    if (scope) {
        if (current_colorscheme_preference == "dark") {
            scope.settings["overallTheme"] = overallThemeToOverleaf[up_overalltheme_dark];
            scope.settings["editorTheme"] = up_editortheme_dark;
        } else if (current_colorscheme_preference == "light") {
            scope.settings["overallTheme"] = overallThemeToOverleaf[up_overalltheme_light];
            scope.settings["editorTheme"] = up_editortheme_light;
        } else {
            console.err(`current colorscheme preference ${current_colorscheme_preference} is not a valid value`);
        }
        scope.$apply();
    }
}

// setup colormode
function autoChangeColorMode(event) {
    current_colorscheme_preference = event.matches ? "dark" : "light";
    switchColorMode();
}
function setupColormode() {
    if (colorscheme !== undefined && up_colormode_switching == true) {
        switchColorMode();
        // if the colorscheme changes
        colorscheme.addEventListener("change", autoChangeColorMode, true);
    }
}
function destructColormode() {
    if (colorscheme !== undefined && up_colormode_switching == false) {
        colorscheme.removeEventListener("change", autoChangeColorMode, true);
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
    const any_notifications_used =
        up_notifications_chats == true || up_notifications_comments == true || up_notifications_comment_threads == true;
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
        else if (Notification.permission !== "denied") {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    sendNotification("Notifications are now enabled");
                }
            });
        }

        // reset notifications if the window is in focus
        addEventListener("focus", resetCounter);

        // set watch on comment threads
        if (up_notifications_comments == true) {
            comments_scope = angular.element("[ng-controller=ReviewPanelController]").scope();
            // if the ReviewPanelController is in scope, set a watcher
            if (comments_scope) {
                // if there are new comments, find the new ones and emit a notification for it
                if (comments_watcher_unbind !== undefined) {
                    throw "comments_watcher_unbind should be undefined at this point";
                }
                comments_watcher_unbind = comments_scope.$watch(
                    "reviewPanel.commentThreads",
                    function (newVal, oldVal) {
                        diffs = deepDiffMapper.map(oldVal, newVal);
                        for (const diff_key in diffs) {
                            // unpack payload
                            var payload = diffs[diff_key];

                            // when a comment is resolved
                            if (payload.resolved && payload.resolved_at && payload.resolved_by_user) {
                                user = payload.resolved_by_user.updated;
                                // check if this is newer than the last reset and if the user did not do it themselves
                                if (
                                    new Date(payload.resolved_at.updated) > lastNotificationResetTimestamp &&
                                    !user.isSelf
                                ) {
                                    sendNotification(`${user.name} resolved a comment`);
                                }
                            }

                            // new comment threads and new comments in a thread use the same structure
                            var actionText = "responded to a comment";
                            if (payload.updated) {
                                payload = payload.updated;
                                actionText = "commented";
                            }
                            messages = payload.messages;
                            for (const message_index in messages) {
                                // unpack message
                                var message = messages[message_index];
                                if (message.updated) {
                                    message = message.updated;
                                    // if notifications of comment threads are not enabled, skip this message   (TODO check if it is safe to break here?)
                                    if (!up_notifications_comment_threads) {
                                        continue;
                                    }
                                }
                                // check if message was sent after latest timestamp, it is not a self-comment and the contents exist
                                if (
                                    message.timestamp > lastNotificationResetTimestamp &&
                                    message.user &&
                                    message.content &&
                                    !message.user.isSelf
                                ) {
                                    sendNotification(`${message.user.name} ${actionText}: ${message.content}`);
                                }
                            }
                        }
                    },
                    true
                );
            }
        }

        // set watch on chat
        if (up_notifications_chats == true) {
            chat_scope = angular.element('[class="infinite-scroll messages"]').children().children();
            if (chat_scope && chat_scope.length && chat_scope[1]) {
                if (chat_observer === undefined) {
                    chat_observer = new MutationObserver(function (mutations) {
                        if (mutations.length) {
                            mutations = mutations[mutations.length - 1];
                        }
                        // only continue if the mutation was at least two seconds after last reset to avoid sending historical chats
                        if (Date.now() > lastNotificationResetTimestamp + 2 * 1000) {
                            for (const message_index in mutations.addedNodes) {
                                message = mutations.addedNodes[message_index];
                                if (message.getElementsByClassName) {
                                    wrapper = message.getElementsByClassName("message-wrapper")[0];
                                    // there is only a name if the sender is not self
                                    if (wrapper.getElementsByClassName("name").length) {
                                        sendername = wrapper
                                            .getElementsByClassName("name")[0]
                                            .getElementsByTagName("span")[0].innerHTML;
                                        contents = wrapper
                                            .getElementsByClassName("message")[0]
                                            .getElementsByClassName("message-content");
                                        last_texts = contents[contents.length - 1].getElementsByTagName("p");
                                        last_text = last_texts[last_texts.length - 1].innerHTML;
                                        sendNotification(`${sendername} in chat: ${last_text}`);
                                    }
                                }
                            }
                        }
                    });
                }
                chat_observer.observe(chat_scope[1], {
                    childList: true,
                    subtree: true,
                });
            }
        }
    }
}

function destructNotifications() {
    if (comments_watcher_unbind !== undefined) {
        comments_watcher_unbind();
        comments_watcher_unbind = undefined;
    }
    if (chat_observer !== undefined) {
        chat_observer.disconnect();
    }
    removeEventListener("focus", resetCounter);
}
// Contents Inserted from notificationsbadge.js
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
    var styleSheet = document.createElement("style");
    styleSheet.innerText = css_text;
    document.head.appendChild(styleSheet);
}
// Contents Inserted from update.js
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
// Contents Inserted from wordcount.js
// keep the ID of the interval timer so it can be removed later on
let wordcount_timer_id;

// recursively check whether the PDF has been compiled with four attempts accross an increasing waittime
async function waitUntilPDFCompiled() {
    return await recursiveCheckAndWait(isPDFLinkAvailable, 500, 5, true);
}

// extracts the word count from the modal if it is visible
function extractWordCount() {
    const modal = document.getElementById("clone-project-modal");
    if (modal && modal !== undefined) {
        const modaltext = modal.outerText;
        const wordcount = modaltext.substring(
            modaltext.lastIndexOf("\nTotal Words:\n") + 14,
            modaltext.lastIndexOf("\nHeaders:")
        );
        const parsedWordCount = parseInt(wordcount);
        if (isNaN(parsedWordCount) == false) {
            return parsedWordCount;
        }
    }
    return false;
}

// summons and waits for the modal to finish loading, then extracts the wordcount
async function getWordCount() {
    let wordcount_el = angular.element("[ng-controller=WordCountModalController]");
    if (wordcount_el && wordcount_el !== undefined && wordcount_el.scope !== undefined) {
        let wordcount_scope = wordcount_el.scope();

        if (wordcount_scope !== undefined && (await waitUntilPDFCompiled()) == true) {
            wordcount_scope.openWordCountModal();

            // check if the wordcount is loaded in quick successions, 100 attempts with a timeout of 50ms
            const wordcount = await recursiveCheckAndWait(extractWordCount, 50, 100);
            wordcount_scope.handleHide();
            if (wordcount == false) {
                console.warn("Unable to get wordcount within 5 seconds, skipping");
                return;
            }
            return wordcount;
        }
    }
}

// retrieve the wordcounts from local storage and add the keys where necessary
function getWordCounts() {
    let wordcounts = localStorage.getObject("wordcounts") || {};
    if (!(this.project_id in wordcounts)) {
        wordcounts[this.project_id] = {};
    }
    const currentdate = getLocalDate();
    if (!(currentdate in wordcounts[this.project_id])) {
        wordcounts[this.project_id][currentdate] = {
            earliest: undefined,
            latest: undefined,
            hasbeennotified: false,
        };
    }
    return wordcounts;
}

// reset the wordcount history (in case you change your system's date / cross the international dateline)
function resetWordCounts() {
    return localStorage.removeItem("wordcounts");
}

// update the wordcount
async function updateWordCount() {
    const currentdate = getLocalDate();
    let wordcounts = getWordCounts();
    const wordcount = await getWordCount();
    const hasbeennotified = wordcounts[this.project_id][currentdate].hasbeennotified;
    if (wordcount === undefined) {
        return;
    }

    // if the earliest wordcount is not defined, use the previous latest wordcount
    if (wordcounts[this.project_id][currentdate].earliest === undefined) {
        wordcounts[this.project_id][currentdate].earliest =
            wordcounts[this.project_id][currentdate].latest || wordcount;
    }
    // update the latest wordcount
    wordcounts[this.project_id][currentdate].latest = wordcount;
    const achieved_wordcount = wordcount - wordcounts[this.project_id][currentdate].earliest;

    // notify the user if the target number of words are reached
    if (hasbeennotified == false && achieved_wordcount >= up_wordcount_dailytarget) {
        new Notification("Awesome, already met today's target!", {
            body: `You wrote ${achieved_wordcount} words, ${
                achieved_wordcount - up_wordcount_dailytarget
            } above target!`,
        });
        wordcounts[this.project_id][currentdate].hasbeennotified = true;
    }

    // notify the user if the target time is reached
    if (hasbeennotified == false && up_wordcount_notificationhour !== undefined) {
        const currenttime = new Date();
        if (currenttime.getHours() == up_wordcount_notificationhour) {
            if (currenttime.getMinutes() <= up_wordcount_interval) {
                if (achieved_wordcount < up_wordcount_dailytarget) {
                    new Notification("You failed to meet today's target", {
                        body: `You wrote ${achieved_wordcount} out of ${up_wordcount_dailytarget} words.`,
                    });
                } else {
                    new Notification("Congrats, you met today's target!", {
                        body: `You wrote ${achieved_wordcount} words, ${
                            achieved_wordcount - up_wordcount_dailytarget
                        } above target!`,
                    });
                }
                wordcounts[this.project_id][currentdate].hasbeennotified = true;
            }
        }
    }

    // save the update object to the localstorage
    localStorage.setObject("wordcounts", wordcounts);
}

// setup the repeated execution of updateWordCount
function setupWordCount() {
    if (up_wordcount_tracking == true) {
        if (this.project_id === undefined) {
            console.warn("Project ID is not defined, unable to keep word count");
            return;
        }
        updateWordCount();
        wordcount_timer_id = setInterval(updateWordCount, 10 * 1000); // up_wordcount_interval * 60 * 1000
    }
}

// stop the repeated execution of updateWordCount
function destructWordCount() {
    if (up_wordcount_tracking == false && wordcount_timer_id !== undefined) {
        clearInterval(wordcount_timer_id);
    }
}
// Contents Inserted from backup.js
backup_types = ["Source", "PDF"];
up_backup = true;
up_backup_type = 0;

function getBackupLink(backup_type_index) {
    if (document.querySelector("#left-menu")) {
        backup_source_html = document
            .querySelector("#left-menu")
            .getElementsByClassName("nav-downloads")[0]
            .getElementsByTagName("li")[backup_type_index];
        if (backup_source_html !== undefined && backup_source_html.getElementsByTagName("a").length > 0) {
            return backup_source_html.getElementsByTagName("a")[0].href;
        }
    }
    return "";
}

function isPDFLinkAvailable() {
    return getBackupLink(1) != "";
}

function doBackup() {
    getBackupLink(up_backup_type);
    // use IndexedDB to write the backups in the background, show an overview in the settings pane where users can download a backup
}

// function setupBackup() {}

// start
setupColormode()
setupNotifications()
setupPreferencesPane()
addCSS()
setAutoUpdateChecking()
setupWordCount()
// setupBackup()
