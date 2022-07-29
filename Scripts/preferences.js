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
