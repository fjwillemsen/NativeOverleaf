// This file is not intended to run by itself, but is inserted into main.js

async function fetchAsync(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

function semanticVersionCompare(a, b) {
    // from https://gist.github.com/iwill/a83038623ba4fef6abb9efca87ae9ccb
    if (a.startsWith(b + "-")) return -1
    if (b.startsWith(a + "-")) return  1
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "case", caseFirst: "upper" })
}

async function checkForUpdate(reportAll = false) {
    tags = await fetchAsync("https://api.github.com/repos/fjwillemsen/NativeOverleaf/tags")
    if (!(tags.length) || tags.length === undefined) {
        console.error("Can not retrieve latest version for update checking")
        return
    }
    latest_version = tags[0].name.replace('v', '')
    comparison = semanticVersionCompare(latest_version, appversion)
    if (comparison == 0 && comparison !== "") {
        console.log("Update check completed, no update available.")
        if (reportAll == true) {
            alert("You're up to date with the latest version!")
        }
    } else if (comparison == 1) {
        goToUpdate = confirm(`Update available! 
            Current: ${appversion}, latest: ${latest_version}.
            Go to downloads page?`)
        if (goToUpdate) {
            window.open("https://github.com/fjwillemsen/NativeOverleaf/releases/tag/v1.2.0")
        }
    } else if (comparison == -1) {
        result = `No update needed, current version (${appversion}) is newer than latest publicly available version (${latest_version}).`
        console.log(result)
        if (reportAll == true) {
            alert(result)
        }
    } else {
        result = `Invalid semantic version comparison outcome: ${comparison}`
        console.log(result)
        if (reportAll == true) {
            alert(result)
        }
    }
}

function setAutoUpdateChecking() {
    // check for updates straight away
    checkForUpdate()
    // check for updates every six hours
    setInterval(checkForUpdate, 6*60*60*1000);
    // trigger the check update function when the version label is clicked
    if (document.querySelector('#versionlabel')) {
        document.querySelector('#versionlabel').onclick = function(){ checkForUpdate(true) }
    }
}
