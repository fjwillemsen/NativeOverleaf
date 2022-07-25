// available themes
editorThemes_light = ['textmate', 'overleaf', 'eclipse']
editorThemes_dark = ['dracula', 'monokai', 'cobalt']
overallThemes_light = ['light-']
overallThemes_dark = ['']

// user preferences
notifications = true
notifications_comments = true
notifications_chats = true
colormode_switching = true
editortheme_dark = editorThemes_dark[0]
editortheme_light = editorThemes_light[0]

// global variables
var notificationCounter = 0
var latestNotificationTimestamp = Date.now()
const originalDocumentTitle = document.title

function switchColorMode(preference) {
    scope = angular.element('[ng-controller=SettingsController]').scope();
    if (scope) {
        if (preference == 'dark') {
            scope.settings["overallTheme"] = overallThemes_dark[0]
            scope.settings["editorTheme"] = editortheme_dark
        } else {
            scope.settings["overallTheme"] = overallThemes_light[0]
            scope.settings["editorTheme"] = editortheme_light
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
    latestNotificationTimestamp = Date.now()
}

function sendNotification(title) {
    new Notification(`${title}`);
    updateCounter(1);
}

// setup colormode
if (window.matchMedia) {
    var colorscheme = window.matchMedia('(prefers-color-scheme: dark)')
    var preference = colorscheme.matches ? "dark" : "light";
    switchColorMode(preference)
    // if the colorscheme changes
    colorscheme.addEventListener('change', event => {
        preference = event.matches ? "dark" : "light";
        switchColorMode(preference)
    });
    // // if the URL changes
    // // not necessary because this script is executed on each new page
    // window.addEventListener('popstate', function() { 
    //     console.log(window.location.pathname)
    // });
}

// setup notifications
if (notifications == true) {
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
    if (notifications_comments == true) {
        comments_scope = angular.element('[ng-controller=ReviewPanelController]').scope();
        // if the ReviewPanelController is in scope, set a watcher
        if (comments_scope) {
            // if there are new comments, find the new ones and emit a notification for it
            comments_scope.$watch('reviewPanel.commentThreads', function(newVal, oldVal) {
                diffs = deepDiffMapper.map(oldVal, newVal)
                console.log(diffs)
                for (const diff_key in diffs) {
                    // unpack payload
                    var payload = diffs[diff_key]
                    if (payload.updated) {
                        payload = payload.updated
                    }
                    messages = payload.messages
                    for (const message_index in messages) {
                        // unpack message
                        var message = messages[message_index]
                        if (message.updated) {
                            message = message.updated
                        }
                        // check if message was sent after latest timestamp, it is not a self-comment and the contents exist
                        if (message.timestamp > latestNotificationTimestamp && message.user && message.content && !(message.user.isSelf)) {
                            sendNotification(`${message.user.name} commented: ${message.content}`)
                        }
                    }
                }
            }, true);
        }
    }
}



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
