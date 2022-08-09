// This file is not intended to run by itself, but is inserted into main.js

// Overleaf has weird designators for the overall theme, so we use more descriptive ones internally
const overallThemeToOverleaf = {
    dark: "",
    light: "light-",
};

function switchColorMode() {
    let scope = angular.element("[ng-controller=SettingsController]").scope();
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
