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
            let comments_scope = angular.element("[ng-controller=ReviewPanelController]").scope();
            // if the ReviewPanelController is in scope, set a watcher
            if (comments_scope) {
                // if there are new comments, find the new ones and emit a notification for it
                if (comments_watcher_unbind !== undefined) {
                    throw "comments_watcher_unbind should be undefined at this point";
                }
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
