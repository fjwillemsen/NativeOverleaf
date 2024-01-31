// This file is not intended to run by itself, but is inserted into main.js

// Overleaf has weird designators for the overall theme, so we use more descriptive ones internally
const overallThemeToOverleaf = {
    dark: "",
    light: "light-",
};

function switchColorModePDF() {
    current_pdfcolor = current_colorscheme_preference == "dark" ? up_pdftheme_dark : up_pdftheme_light;
    if (current_pdfcolor == "dark") {
        $(".pdf-viewer .pdfjs-viewer .page").addClass("conditional-invert-colors");
    } else if (current_pdfcolor == "light") {
        $(".pdf-viewer .pdfjs-viewer .page").removeClass("conditional-invert-colors");
    } else {
        console.error(`current pdfcolor preference ${current_pdfcolor} is not a valid value`);
    }
}

function switchColorMode() {
    console.log("switchColormode");
    // let scope = angular.element("[ng-controller=SettingsController]").scope();
    // let scope = angular.element(document.querySelector(".settings")).scope();
    // let scope = angular.element(document.querySelector("[ng-controller=IdeController]")).scope();
    let scope = angular.element("[ng-controller=IdeController]").scope();
    console.log(scope);
    if (scope && scope.settings) {
        scope.$applyAsync(function () {
            if (current_colorscheme_preference == "dark") {
                scope.settings["overallTheme"] = overallThemeToOverleaf[up_overalltheme_dark];
                scope.darkTheme = !up_overalltheme_light;
                scope.settings["editorTheme"] = up_editortheme_dark;
            } else if (current_colorscheme_preference == "light") {
                scope.settings["overallTheme"] = overallThemeToOverleaf[up_overalltheme_light];
                scope.darkTheme = !up_overalltheme_light;
                scope.settings["editorTheme"] = up_editortheme_light;
            } else {
                console.error(`current colorscheme preference ${current_colorscheme_preference} is not a valid value`);
            }
            // scope.$apply();
            console.log("Applied scope change");
            console.log(scope);
            console.log(angular.element("[ng-controller=IdeController]").scope());
            switchColorModePDF();
        });
    } else {
        console.log("No scope settings:");
        console.log(scope);
    }
}

// setup colormode
function autoChangeColorMode(event) {
    current_colorscheme_preference = event.matches ? "dark" : "light";
    switchColorMode();
}
async function setupColormode() {
    if (colorscheme !== undefined && up_colormode_switching == true) {
        switchColorMode();
        // listen to when the colorscheme changes
        colorscheme.addEventListener("change", autoChangeColorMode, true);
    }
    if ((await waitUntilPDFCompiled()) != false) {
        // apply the color mode directly
        switchColorModePDF();
        // when the PDF is changed, apply the color mode
        if (pdf_change_observer === undefined) {
            pdf_change_observer = new MutationObserver(function (mutations) {
                console.log("PDF changed, applying color mode");
                switchColorModePDF();
            });
        }
        // wait until the PDF is loaded before registering the observer
        let pdf_viewer = document.getElementsByClassName("pdfViewer")[0];
        if (pdf_viewer !== undefined) {
            pdf_change_observer.observe(pdf_viewer, {
                attributes: true,
                childList: true,
                subTree: true,
            });
        } else {
            console.warn(
                "Element .pdfViewer was undefined, have you set the PDF viewer to something other than 'Overleaf'?"
            );
        }
    }
}
function destructColormode() {
    // remove the eventlistener for changes to the system theme
    if (colorscheme !== undefined && up_colormode_switching == false) {
        colorscheme.removeEventListener("change", autoChangeColorMode, true);
    }
    // no longer listen for when the PDF changes
    if (pdf_change_observer !== undefined) {
        pdf_change_observer.disconnect();
        $(".pdf-viewer .pdfjs-viewer .page").removeClass("conditional-invert-colors");
    }
}
