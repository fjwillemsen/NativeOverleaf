// This file is not intended to run by itself, but is inserted into main.js

// inserting CSS
function addCSS() {
    const css_text = `
        body {
            background-color: #fff;
            color: black;
        }

        .loading-screen {
            background-color: #fff;
        }

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

        #review-panel {
            background-color: #dadfed;
            color: #6b7797;
            border-left: 0 solid #d9d9d9;
        }

        .review-panel-toolbar {
            background-color: #fafafa;
        }

        .rp-entry {
            background-color: #fff;
            color: #6b7797;
        }

        .rp-comment-input {
            background-color: #fff;
        }

        .rp-nav {
            background-color: #fafafa;
        }

        .file-view {
            background-color: #f0f0f0;
        }

        .history-entry-details {
            background-color: #fff;
            color: #5d6879;
        }

        .history-entry-change-doc {
            color: #3f3f3f;
        }

        .history-labels-list, .history-labels-list-compare {
            background-color: #fff;
        }
        
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #282a35;
                color: white;
            }

            .loading-screen {
                background-color: #282a35;
            }

            .loading-panel {
                background-color: #282a35;
                color: white;
            }

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

            #review-panel {
                background-color: #485263 !important;
                color: white !important;
                border-left: 0 solid black !important;
            }

            .review-panel-toolbar {
                background-color: #282a35 !important;
            }

            .rp-entry {
                background-color: #d1cfbc !important;
                color: darkslategray !important;
            }

            .rp-comment-input {
                background-color: floralwhite !important;
            }

            .rp-nav {
                background-color: floralwhite !important;
            }

            .file-view {
                background-color: #282a35 !important;
            }

            .history-entry-details {
                background-color: #485263 !important;
                color: floralwhite !important;
            }

            .history-entry-change-doc {
                color: floralwhite !important;
            }

            .history-labels-list, .history-labels-list-compare {
                background-color: #485263 !important;
            }

            .project-list-main {
                background-color: #485263;
            }

            .project-list-card {
                background-color: #282a35;
                color: white;
            }

            .project-list-table-name-link {
                color: lightskyblue;
            }

            .project-list-table-row:hover {
                background-color: darkslategray;
            }

            .current-plan a.current-plan-label {
                color: floralwhite;
            }

            footer.site-footer {
                background-color: black;
            }
        }
    `;
    let styleSheet = document.createElement("style");
    styleSheet.innerText = css_text;
    document.head.appendChild(styleSheet);
}
