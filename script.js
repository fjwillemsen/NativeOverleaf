editorThemes_light = ['textmate', 'overleaf', 'eclipse']
editorThemes_dark = ['dracula', 'monokai', 'cobalt']
overallThemes_light = ['light-']
overallThemes_dark = ['']

function switchColorMode(preference) {
    scope = angular.element('[ng-controller=SettingsController]').scope();
    if (scope) {
        if (preference == 'dark') {
            scope.settings["overallTheme"] = overallThemes_dark[0]
            scope.settings["editorTheme"] = editorThemes_dark[0]
        } else {
            scope.settings["overallTheme"] = overallThemes_light[0]
            scope.settings["editorTheme"] = editorThemes_light[0]
        }
        scope.$apply();
    }
}

if (window.matchMedia) {
    var colorscheme = window.matchMedia('(prefers-color-scheme: dark)')
    var preference = colorscheme.matches ? "dark" : "light";
    switchColorMode(preference)
    // if the colorscheme changes
    colorscheme.addEventListener('change', event => {
        preference = event.matches ? "dark" : "light";
        switchColorMode(preference)
    });
    // if the URL changes
    window.addEventListener('popstate', function() { 
        console.log(window.location.pathname)
    });
}
