// This file is not intended to run by itself, but is inserted into main.js

// Overleaf has weird designators for the overall theme, so we use more descriptive ones internally
const overallThemeToOverleaf = {
    dark: "",
    light: "light-",
};

function switchColorModePDF() {
    if (up_colormode_switching_pdf == true) {
        if (current_colorscheme_preference == "dark") {
            $(".pdf-viewer .pdfjs-viewer .page").addClass("conditional-invert-colors");
        } else if (current_colorscheme_preference == "light") {
            $(".pdf-viewer .pdfjs-viewer .page").removeClass("conditional-invert-colors");
        }
    }
}

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
        switchColorModePDF();
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
    if (up_colormode_switching_pdf == true && (await waitUntilPDFCompiled()) != false) {
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
    if (colorscheme !== undefined && up_colormode_switching == false) {
        colorscheme.removeEventListener("change", autoChangeColorMode, true);
    }
    // no longer listen for when the PDF changes
    if (up_colormode_switching_pdf == false && pdf_change_observer !== undefined) {
        pdf_change_observer.disconnect();
        $(".pdf-viewer .pdfjs-viewer .page").removeClass("conditional-invert-colors");
    }
}
