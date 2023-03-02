const extensionId = "opgfklgemimfakkhhenkjpebopabfjjd";

// Release
const writefullUrl = "https://storage.googleapis.com/writefull-cdn/writefull.js";

let isRunning = false;
document.addEventListener("readystatechange", (event) => {
    isRunning = true;
    console.log("Writefull");

    if (
        document.readyState === "interactive" ||
        (document.readyState === "complete" && !window._writefull && !isRunning)
    ) {
        console.log("Writefull readystatechange");
        const scriptCM6 = document.createElement("script");
        scriptCM6.type = "text/javascript";
        scriptCM6.innerHTML = `
      window.addEventListener('UNSTABLE_editor:extensions', (event) => {
        if (event.detail) {
          const { CodeMirror, extensions } = event.detail;

          window._writefull = {
            ...CodeMirror,
            extensions
          }
        }

        if (window.w$) {
          w$.reloadEditor();
        }
      });
      window.addEventListener('editor:extensions', (event) => {
        if (event.detail) {
          const { CodeMirror, extensions } = event.detail;

          window._writefull = {
            ...CodeMirror,
            extensions
          }
        }

        if (window.w$) {
          w$.reloadEditor();
        }
      });
    `;
        document.body.append(scriptCM6);
        setTimeout(() => {
            scriptCM6.remove();
        }, 0);
        isRunning = false;
    }
});

const load = function () {
    setTimeout(function () {
        const script = document.createElement("script");
        script.src = `${writefullUrl}?ts=${+new Date()}`;
        console.log(script.src);
        script.type = "text/javascript";
        document.body.append(script);
        console.log("Writefull appended!");
        console.log(document.body);
        setTimeout(() => {
            script.remove();
        }, 0);
    }, 1000);
};
window.addEventListener("load", load);
