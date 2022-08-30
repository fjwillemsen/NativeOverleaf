// This file is not intended to run by itself, but is inserted into main.js

// inserting CSS
function addCSS() {
    const css_text = `
        .native-overleaf-settings {
            display: inline-block;
            width: 260px;
        }

        .settings-toggle {
            cursor: pointer;
            display: inline-block;
        }
        .settings-toggle-switch {
            display: inline-block;
            background: #2e3644;
            border-radius: 16px;
            width: 58px;
            height: 32px;
            position: relative;
            vertical-align: middle;
            transition: background 0.25s;
        }
        .settings-toggle-switch:before, .settings-toggle-switch:after {
            content: "";
        }
        .settings-toggle-switch:before {
            display: block;
            background: linear-gradient(to bottom, #fff 0%, #eee 100%);
            border-radius: 50%;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
            width: 24px;
            height: 24px;
            position: absolute;
            top: 4px;
            left: 4px;
            transition: left 0.25s;
        }
        .settings-toggle:hover .settings-toggle-switch:before {
            background: linear-gradient(to bottom, #fff 0%, #fff 100%);
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
        }
        .settings-toggle-checkbox:checked + .settings-toggle-switch {
            background: #408827;
        }
        .settings-toggle-checkbox:checked + .settings-toggle-switch:before {
            left: 30px;
        }
        .settings-toggle-checkbox {
            position: absolute;
            visibility: hidden;
        }
        .settings-toggle-label {
            margin-left: 5px;
            position: relative;
            top: 2px;
        }
        dialog {
            width: 80vw;
            background: #EEEFEE;
            color: black;
            border-color: #E9E9E9;
            margin: auto;
            position: fixed;
            box-shadow: 5px;
            border-radius: 10px;
        }
        dialog img {
            max-width: 80%;       
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        dialog::backdrop {
            background: black;
            opacity: 0.7;
            backdrop-filter: blur(25px);
        }
        
        @media (prefers-color-scheme: dark) {
            dialog {
                background: #282A35;
                color: white;
                border-color: #485263;
            }
            dialog #closebutton {
                color: white;
            }
            #wordcountchart {
                filter: invert(1) hue-rotate(180deg);
            }

            .pdf-viewer {
                background-color: #485263;
            }

            .conditional-invert-colors {
                filter: invert(100%) hue-rotate(180deg);
            }
        }
    `;
    let styleSheet = document.createElement("style");
    styleSheet.innerText = css_text;
    document.head.appendChild(styleSheet);
}
