// This file is not intended to run by itself, but is inserted into main.js

function getThemesHTML(array) {
    var str = ""
    for (const index in array) {
        val = array[index]
        str += `<option value="${val}">${val}</option>\n`
    }
    return str
}

// settings menu pane
function setupPreferencesPane() {
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
