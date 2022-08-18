// This file is not intended to run by itself, but is inserted into main.js

function sendNotification(text) {
    new Notification(`${text}`);
    updateCounter(1);
}

// function to remove special characters and truncate for notification text
function cleanAndTruncateText(text, max_characters = 15) {
    // remove linebreaks
    text = text.replace(/(\r\n|\n|\r)/gm, "");
    // truncate
    if (text.length > max_characters) {
        text = text.substring(0, max_characters) + "...";
    }
    return text;
}

// function returning whether the time since last notification is greater than the number of seconds
function notificationsCooledDown(seconds = 5, timestamp = lastNotificationResetTimestamp) {
    return Date.now() - timestamp > seconds * 1000;
}

// setup notifications
async function setupNotifications() {
    // first check if notifications are used at all before setting up
    const any_notifications_used =
        up_notifications_chats == true ||
        up_notifications_comments == true ||
        up_notifications_comment_threads == true ||
        up_notifications_tracked_changes_created == true ||
        up_notifications_tracked_changes_updated == true ||
        up_notifications_tracked_changes_resolved == true;
    if (any_notifications_used == true) {
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

        // reset notifications if the document/window focus becomes true
        addEventListener("focus", resetCounter);

        // set watch on tracked changes
        if (
            up_notifications_tracked_changes_created == true ||
            up_notifications_tracked_changes_updated == true ||
            up_notifications_tracked_changes_resolved == true
        ) {
            let changes_scope = angular.element("[ng-controller=ReviewPanelController]").scope();
            // if the ReviewPanelController is in scope, set a watcher
            if (changes_scope && changes_scope !== undefined) {
                if (changes_watcher_unbind !== undefined) {
                    throw "changes_watcher_unbind should be undefined at this point";
                }
                // if there are new changes, find the new ones and emit a notification for it
                changes_watcher_unbind = changes_scope.$watch(
                    `reviewPanel.entries`,
                    function (newVal, oldVal) {
                        // extract the actual object using the key
                        oldVal = oldVal[Object.keys(oldVal)[0]];
                        newVal = newVal[Object.keys(newVal)[0]];
                        // get the differences between the old and the new object
                        const diffs = deepDiffMapper.map(oldVal, newVal);
                        const users = angular.element("[ng-controller=ReviewPanelController]").scope()
                            .reviewPanel.formattedProjectMembers;
                        for (const diff_key in diffs) {
                            // unpack payload
                            let payload = diffs[diff_key];
                            if (payload == undefined) {
                                continue;
                            }

                            // unwrap the payload if necessary
                            if (payload.content && payload.content !== undefined) {
                                payload = payload.content;
                            }

                            // if created, updated or resolved
                            if (payload.type && payload.type !== undefined) {
                                if (payload.type == "created") {
                                    let message = payload.updated;
                                    message.content = cleanAndTruncateText(message.content);
                                    const user = users[message.metadata.user_id];
                                    if (
                                        up_notifications_tracked_changes_created == true &&
                                        user.isSelf != true &&
                                        new Date(message.metadata.ts) > new Date(lastNotificationResetTimestamp) &&
                                        notificationsCooledDown(1, lastChangeNotificationTimestamp) // notificationsCooledDown is checked for 1 second because sometimes an update becomes a create, we want to avoid sending notifications for those
                                    ) {
                                        if (message.type == "aggregate-change") {
                                            sendNotification(
                                                `${user.name} suggests changing "${cleanAndTruncateText(
                                                    message.metadata.replaced_content
                                                )}" to "${message.content}"`
                                            );
                                        } else if (message.type == "insert") {
                                            sendNotification(`${user.name} suggests adding "${message.content}"`);
                                        } else if (message.type == "delete") {
                                            sendNotification(`${user.name} suggests removing "${message.content}"`);
                                        }
                                        lastChangeNotificationTimestamp = Date.now();
                                    }
                                } else if (payload.type == "updated") {
                                    // we can not check which user did this, so if the window has focus, we assume the user did it and don't notify
                                    if (
                                        up_notifications_tracked_changes_updated == true &&
                                        payload.original !== undefined &&
                                        typeof payload.original == "string" &&
                                        payload.updated !== undefined &&
                                        typeof payload.updated == "string" &&
                                        document.hasFocus() == false
                                    ) {
                                        // check if it was more than 60 seconds ago that the last tracked change notification was sent
                                        if (notificationsCooledDown(60, lastChangeNotificationTimestamp)) {
                                            sendNotification(
                                                `Suggested change "${cleanAndTruncateText(
                                                    payload.original
                                                )}" was updated to "${cleanAndTruncateText(payload.updated)}"`
                                            );
                                        }
                                        lastChangeNotificationTimestamp = Date.now();
                                    }
                                } else if (payload.type == "deleted") {
                                    // we can not check which user did this, so if the window has focus, we assume the user did it and don't notify
                                    if (
                                        up_notifications_tracked_changes_resolved == true &&
                                        payload.original !== undefined &&
                                        notificationsCooledDown(1) &&
                                        document.hasFocus() == false
                                    ) {
                                        let message = payload.original;
                                        message.content = cleanAndTruncateText(message.content);
                                        if (payload.original.type == "aggregate-change") {
                                            sendNotification(
                                                `Resolved suggestion to change "${cleanAndTruncateText(
                                                    message.metadata.replaced_content
                                                )}" to "${message.content}"`
                                            );
                                        } else if (message.type == "insert") {
                                            sendNotification(`Resolved suggestion to add "${message.content}"`);
                                        } else if (message.type == "delete") {
                                            sendNotification(`Resolved suggestion to delete "${message.content}"`);
                                        }
                                        lastChangeNotificationTimestamp = Date.now();
                                    }
                                } else {
                                    console.warn("Unrecognized payload type", payload);
                                }
                            }
                        }
                    },
                    true
                );
            }
        }

        // set watch on comment threads
        if (up_notifications_comments == true) {
            let comments_scope = angular.element("[ng-controller=ReviewPanelController]").scope();
            // if the ReviewPanelController is in scope, set a watcher
            if (comments_scope && comments_scope !== undefined) {
                if (comments_watcher_unbind !== undefined) {
                    throw "comments_watcher_unbind should be undefined at this point";
                }
                // if there are new comments, find the new ones and emit a notification for it
                comments_watcher_unbind = comments_scope.$watch(
                    "reviewPanel.commentThreads",
                    function (newVal, oldVal) {
                        const diffs = deepDiffMapper.map(oldVal, newVal);
                        for (const diff_key in diffs) {
                            // unpack payload
                            let payload = diffs[diff_key];

                            // when a comment is resolved
                            if (payload.resolved && payload.resolved_at && payload.resolved_by_user) {
                                const user = payload.resolved_by_user.updated;
                                // check if this is newer than the last reset and if the user did not do it themselves
                                if (
                                    new Date(payload.resolved_at.updated) > lastNotificationResetTimestamp &&
                                    !user.isSelf
                                ) {
                                    sendNotification(`${user.name} resolved a comment`);
                                }
                            }

                            // new comment threads and new comments in a thread use the same structure
                            let actionText = "responded to a comment";
                            if (payload.updated) {
                                payload = payload.updated;
                                actionText = "commented";
                            }
                            const messages = payload.messages;
                            for (const message_index in messages) {
                                // unpack message
                                let message = messages[message_index];
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
            let chat_scope = angular.element('[class="infinite-scroll messages"]').children().children();
            if (chat_scope && chat_scope.length && chat_scope[1]) {
                if (chat_observer === undefined) {
                    chat_observer = new MutationObserver(function (mutations) {
                        if (mutations.length) {
                            mutations = mutations[mutations.length - 1];
                        }
                        // only continue if the mutation was at least two seconds after last reset to avoid sending historical chats
                        if (notificationsCooledDown(2)) {
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
    // do not check for requiresDestruction here because some preferences use this function to reset the notifications
    if (comments_watcher_unbind !== undefined) {
        comments_watcher_unbind();
        comments_watcher_unbind = undefined;
    }
    if (changes_watcher_unbind !== undefined) {
        changes_watcher_unbind();
        changes_watcher_unbind = undefined;
    }
    if (chat_observer !== undefined) {
        chat_observer.disconnect();
    }
    removeEventListener("focus", resetCounter);
}

// function that counts the number of enabled notification preferences
function countEnabledNotificationPreferences() {
    return (
        !!up_notifications_chats +
        !!up_notifications_comments +
        !!up_notifications_comment_threads +
        !!up_notifications_tracked_changes_created +
        !!up_notifications_tracked_changes_updated +
        !!up_notifications_tracked_changes_resolved
    );
}

// function returning whether the notifications need to be setup again AFTER a UP has been set to true that was false before
function notificationsRequiresSetup() {
    return countEnabledNotificationPreferences() == 1;
}

// function returning whether the notifications can and should be deconstructed
function notificationsRequiresDestruction() {
    return countEnabledNotificationPreferences() == 0;
}
