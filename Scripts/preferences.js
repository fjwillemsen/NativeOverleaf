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
let up_notifications_comments = localStorage.getObject("notifications_comment") || true;
let up_notifications_comment_threads = localStorage.getObject("notifications_comment_response") || true;
let up_notifications_chats = localStorage.getObject("notifications_chat") || true;
let up_notifications_tracked_changes_created = localStorage.getObject("notifications_tracked_changes_created") || true;
let up_notifications_tracked_changes_updated = localStorage.getObject("notifications_tracked_changes_updated") || true;
let up_notifications_tracked_changes_resolved =
    localStorage.getObject("notifications_tracked_changes_resolved") || true;
let up_colormode_switching = localStorage.getObject("colormode_switching") || true;
let up_colormode_switching_pdf = localStorage.getObject("colormode_switching_pdf") || true;
let up_overalltheme_dark = localStorage.getObject("overalltheme_dark") || overallThemes_dark[0];
let up_overalltheme_light = localStorage.getObject("overalltheme_light") || overallThemes_light[0];
let up_editortheme_dark = localStorage.getObject("editortheme_dark") || editorThemes_dark[0];
let up_editortheme_light = localStorage.getObject("editortheme_light") || editorThemes_light[0];
let up_wordcount_tracking = localStorage.getObject("wordcount_tracking") || true; // whether wordcount tracking is enabled
let up_wordcount_dailytarget = localStorage.getObject("wordcount_dailytarget") || 200; // net number of words that must be produced daily
let up_wordcount_notificationhour = localStorage.getObject("wordcount_notificationhour") || 18; // hour of the day at which the user is notified whether they have achieved their goal

// user preferences boundaries
let up_wordcount_dailytarget_min = 1;
let up_wordcount_dailytarget_max = 2147483647;
let up_wordcount_notificationhour_min = -1;
let up_wordcount_notificationhour_max = 23;

// settings form
let settings_form;

function getFormSelectHTML(category_dicts, category_names) {
    let str = "";
    for (category_index in category_dicts) {
        let endstr = "";
        if (category_names.length - 1 >= category_index) {
            str += `<optgroup label="${category_names[category_index]}">`;
            endstr += "</optgroup>";
        }
        category_dict = category_dicts[category_index];
        for (let key in category_dict) {
            str += `<option value="${key}">${category_dict[key]}</option>\n`;
        }
        str += endstr;
    }
    return str;
}

// settings menu pane
function setupPreferencesPane() {
    const settings_html = `
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
                    <br/>
                    <br/>
                    <b>Suggested Changes</b><br/>
                    <i>Get notifications on tracked changes</i>
                    <br/>
                    <label class="settings-toggle">
                        <input id="notifications_tracked_changes_created" class="settings-toggle-checkbox" type="checkbox">
                        <div class="settings-toggle-switch"></div>
                        <span class="settings-toggle-label">Added suggestions</span>
                    </label>
                    <br/>
                    <label class="settings-toggle">
                        <input id="notifications_tracked_changes_updated" class="settings-toggle-checkbox" type="checkbox">
                        <div class="settings-toggle-switch"></div>
                        <span class="settings-toggle-label">Updated suggestions</span>
                    </label>
                    <br/>
                    <label class="settings-toggle">
                        <input id="notifications_tracked_changes_resolved" class="settings-toggle-checkbox" type="checkbox">
                        <div class="settings-toggle-switch"></div>
                        <span class="settings-toggle-label">Resolved suggestions</span>
                    </label>
                <hr/>
                <h6>Dark / Light Mode</h6>
                    <label class="settings-toggle">
                        <input id="colormode_switching" class="settings-toggle-checkbox" type="checkbox">
                        <div class="settings-toggle-switch"></div>
                        <span class="settings-toggle-label">Follow system</span>
                    </label>
                    <label class="settings-toggle">
                        <input id="colormode_switching_pdf" class="settings-toggle-checkbox" type="checkbox">
                        <div class="settings-toggle-switch"></div>
                        <span class="settings-toggle-label">Include PDF</span>
                    </label>
                    <br/>
                    <i>This option forces the PDF viewer to inverted colors. This does not change the PDF file itself.</i>
                    <br/>
                    <br/>
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
                    <br/>
                    <br/>
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
                    <p>When the document is recompiled, this keeps track of the number of words, allowing you to see your progress.</p>
                    <label class="settings-toggle">
                        <input id="wordcount_tracking" class="settings-toggle-checkbox" type="checkbox">
                        <div class="settings-toggle-switch"></div>
                        <span class="settings-toggle-label">Tracking</span>
                    </label>
                    <br/>
                        <label for="wordcount_dailytarget">Daily number of words target:<br/><i>(0 means no target)</i></label>
                        <input type="number" id="wordcount_dailytarget" min="${up_wordcount_dailytarget_min}" max="${up_wordcount_dailytarget_max}">
                    <br/>
                        <label for="wordcount_notificationhour">Hour of daily notification:<br/><i>(0 to 23, -1 means no notification)</i></label>
                        <input type="number" id="wordcount_notificationhour" min="${up_wordcount_notificationhour_min}" max="${up_wordcount_notificationhour_max}">
                    <br/>
                    <br/>
                        <div class="btn btn-primary" id="button_show_wordcount_graph">Show wordcount graph</div>
                    <br/>
                    <br/>
                        <div class="btn btn-warning" id="button_reset_wordcount">Reset wordcount</div>
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
        settings_form.querySelector("#notifications_tracked_changes_created").checked =
            up_notifications_tracked_changes_created;
        settings_form.querySelector("#notifications_tracked_changes_updated").checked =
            up_notifications_tracked_changes_updated;
        settings_form.querySelector("#notifications_tracked_changes_resolved").checked =
            up_notifications_tracked_changes_resolved;
        settings_form.querySelector("#colormode_switching").checked = up_colormode_switching;
        settings_form.querySelector("#colormode_switching_pdf").checked = up_colormode_switching_pdf;
        settings_form.querySelector("#overalltheme_dark").value = up_overalltheme_dark;
        settings_form.querySelector("#overalltheme_light").value = up_overalltheme_light;
        settings_form.querySelector("#editortheme_dark").value = up_editortheme_dark;
        settings_form.querySelector("#editortheme_light").value = up_editortheme_light;
        settings_form.querySelector("#wordcount_tracking").checked = up_wordcount_tracking;
        settings_form.querySelector("#wordcount_dailytarget").value = up_wordcount_dailytarget;
        settings_form.querySelector("#wordcount_notificationhour").value = up_wordcount_notificationhour;

        // set the disabled values where necessary
        settings_form.querySelector("#colormode_switching_pdf").disabled = !up_colormode_switching;
        settings_form.querySelector("#overalltheme_dark").disabled = !up_colormode_switching;
        settings_form.querySelector("#overalltheme_light").disabled = !up_colormode_switching;
        settings_form.querySelector("#editortheme_dark").disabled = !up_colormode_switching;
        settings_form.querySelector("#editortheme_light").disabled = !up_colormode_switching;
        settings_form.querySelector("#wordcount_dailytarget").disabled = !up_wordcount_tracking;
        settings_form.querySelector("#wordcount_notificationhour").disabled = !up_wordcount_tracking;

        // listen for changes and trigger setting change handlers
        settings_form.addEventListener("change", function () {
            for (let id_key in settings_handler) {
                settings_handler[id_key](id_key, settings_form.querySelector(`#${id_key}`));
            }
        });

        // listen for button clicks
        document.getElementById("button_show_wordcount_graph").addEventListener("click", () => {
            showWordCountChart();
        });
        document.getElementById("button_reset_wordcount").addEventListener("click", () => {
            let text_number_of_days = "";
            if (wordcounts !== undefined && wordcounts[this.project_id] !== undefined) {
                text_number_of_days = `You currently have ${
                    Object.keys(wordcounts[this.project_id]).length
                } tracked days.`;
            }
            const resetWordCount = confirm(`Are you sure you want to remove all tracked wordcount history?
                    ${text_number_of_days}`);
            if (resetWordCount) {
                resetWordCounts();
                setupWordCount();
            }
        });
    }
}

// setting handlers
const settings_handler = {
    notifications_chat: set_notifications_chat,
    notifications_comment: set_notifications_comment,
    notifications_comment_response: set_notifications_comment_response,
    notifications_tracked_changes_created: set_notifications_tracked_changes_created,
    notifications_tracked_changes_updated: set_notifications_tracked_changes_updated,
    notifications_tracked_changes_resolved: set_notifications_tracked_changes_resolved,
    colormode_switching: set_colormode_switching,
    colormode_switching_pdf: set_colormode_switching_pdf,
    overalltheme_dark: set_overalltheme_dark,
    overalltheme_light: set_overalltheme_light,
    editortheme_dark: set_editortheme_dark,
    editortheme_light: set_editortheme_light,
    wordcount_tracking: set_wordcount_tracking,
    wordcount_dailytarget: set_wordcount_dailytarget,
    wordcount_notificationhour: set_wordcount_notificationhour,
};

function set_notifications_tracked_changes_created(key, value) {
    if (value.checked != up_notifications_tracked_changes_created) {
        up_notifications_tracked_changes_created = value.checked;
        localStorage.setObject(key, value.checked);
        if (up_notifications_tracked_changes_created == true && notificationsRequiresSetup() == true) {
            // register the notifications again
            setupNotifications();
        } else if (notificationsRequiresDestruction() == true) {
            destructWordCount();
        }
    }
}

function set_notifications_tracked_changes_updated(key, value) {
    if (value.checked != up_notifications_tracked_changes_updated) {
        up_notifications_tracked_changes_updated = value.checked;
        localStorage.setObject(key, value.checked);
        if (up_notifications_tracked_changes_updated == true && notificationsRequiresSetup() == true) {
            // register the notifications again
            setupNotifications();
        } else if (notificationsRequiresDestruction() == true) {
            destructWordCount();
        }
    }
}

function set_notifications_tracked_changes_resolved(key, value) {
    if (value.checked != up_notifications_tracked_changes_resolved) {
        up_notifications_tracked_changes_resolved = value.checked;
        localStorage.setObject(key, value.checked);
        if (up_notifications_tracked_changes_resolved == true && notificationsRequiresSetup() == true) {
            // register the notifications again
            setupNotifications();
        } else if (notificationsRequiresDestruction() == true) {
            destructWordCount();
        }
    }
}

//
//
// SETTERS
//
//

//
// Wordcounts
//

function set_wordcount_tracking(key, value) {
    if (value.checked != up_wordcount_tracking) {
        up_wordcount_tracking = value.checked;
        localStorage.setObject(key, value.checked);
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

function set_wordcount_dailytarget(key, value) {
    if (value.value < up_wordcount_dailytarget_min || value.value > up_wordcount_dailytarget_max) {
        alert(
            `You set ${value.value}, but wordcount daily target must be between ${up_wordcount_dailytarget_min} and ${up_wordcount_dailytarget_max}`
        );
        settings_form.querySelector(`#${key}`).value = up_wordcount_dailytarget;
    } else if (value.value != up_wordcount_dailytarget) {
        up_wordcount_dailytarget = value.value;
        localStorage.setObject(key, value.value);
        // reset the hasBeenNotified field
        setHasBeenNotified(false);
    }
}

function set_wordcount_notificationhour(key, value) {
    if (value.value < up_wordcount_notificationhour_min || value.value > up_wordcount_notificationhour_max) {
        alert(
            `You set ${value.value}, but wordcount notification hour must be between ${up_wordcount_notificationhour_min} and ${up_wordcount_notificationhour_max}`
        );
        settings_form.querySelector(`#${key}`).value = up_wordcount_notificationhour;
    }
    if (value.value != up_wordcount_notificationhour) {
        up_wordcount_notificationhour = value.value;
        localStorage.setObject(key, value.value);
        // reset the hasBeenNotified field
        setHasBeenNotified(false);
    }
}

//
// Notifications
//

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

//
// Themes
//

function set_colormode_switching(key, value) {
    if (value.checked != up_colormode_switching) {
        up_colormode_switching = value.checked;
        localStorage.setObject(key, value.checked);
        settings_form.querySelector("#colormode_switching_pdf").disabled = !up_colormode_switching;
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

function set_colormode_switching_pdf(key, value) {
    if (value.checked != up_colormode_switching_pdf) {
        up_colormode_switching_pdf = value.checked;
        localStorage.setObject(key, value.checked);
        if (up_colormode_switching_pdf == true) {
            // register the event listener again
            setupColormode();
        } else {
            // remove the event listener
            destructColormode();
        }
    }
}

function themesetter(user_preference_variable_name, key, value) {
    const user_preference_variable = eval(user_preference_variable_name);
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
