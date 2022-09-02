// This file is not intended to run by itself, but is inserted into main.js

async function fetchAsync(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

// function to semantically compare versions, a > b = 1, a == b = 0, a < b = -1
function semanticVersionCompare(a, b) {
    // from https://gist.github.com/iwill/a83038623ba4fef6abb9efca87ae9ccb
    if (a.startsWith(b + "-")) return -1;
    if (b.startsWith(a + "-")) return 1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "case", caseFirst: "upper" });
}

// function to obtain the tags of all releases
async function getTags() {
    const tags = await fetchAsync("https://api.github.com/repos/fjwillemsen/NativeOverleaf/tags");
    if (tags == undefined || !tags.length || tags.length === undefined) {
        console.error("Can not retrieve latest version for update checking");
    }
    return tags;
}

function tagToVersion(tag) {
    return tag.replace("v", "");
}

function versionToTag(version) {
    return `v${version}`;
}

// function to obtain the tags released after a release
async function getTagsAfter(previous_version) {
    let tags = await getTags();
    if (tags && tags != undefined && tags.length) {
        tags = tags.filter((tag) => {
            const version = tagToVersion(tag.name);
            return semanticVersionCompare(version, previous_version) == 1;
        });
        return tags.map((tag) => tag.name);
    } else {
        console.error("Could not get tags: ", tags);
    }
}

async function checkForUpdate(reportAll = false) {
    const tags = await getTags();
    const latest_version = tagToVersion(tags[0].name);

    // first check if we have not already notified the user of this latest version
    const previous_version_checked = localStorage.getObject("previous_version_checked");
    if (
        previous_version_checked !== undefined &&
        semanticVersionCompare(latest_version, previous_version_checked) == 0
    ) {
        console.log("User already notified, skipping update notification");
        return;
    }
    localStorage.setObject("previous_version_checked", latest_version);

    // compare the latest release to the current appversion
    const comparison = semanticVersionCompare(latest_version, appversion);
    if (comparison == 0 && comparison !== "") {
        console.log("Update check completed, no update available.");
        if (reportAll == true) {
            alert("You're up to date with the latest version!");
        }
    } else if (comparison == 1) {
        const goToUpdate = confirm(`Update available! 
            Current: ${appversion}, latest: ${latest_version}.
            Go to downloads page?`);
        if (goToUpdate) {
            window.open("https://github.com/fjwillemsen/NativeOverleaf/releases/latest/");
        }
    } else if (comparison == -1) {
        const result_text = `No update needed, current version (${appversion}) is newer than latest publicly available version (${latest_version}).`;
        console.log(result_text);
        if (reportAll == true) {
            alert(result_text);
        }
    } else {
        const result_text = `Update check failed, invalid semantic version comparison outcome: ${comparison}`;
        console.warn(result_text);
        alert(result_text);
    }
}

function setAutoUpdateChecking() {
    // check for updates straight away
    checkForUpdate();
    // check for updates every six hours
    setInterval(checkForUpdate, 6 * 60 * 60 * 1000);
    // trigger the check update function when the version label is clicked
    if (document.querySelector("#versionlabel")) {
        document.querySelector("#versionlabel").onclick = function () {
            checkForUpdate(true);
        };
    }
}

function checkIfUpdated() {
    const previous_version = localStorage.getObject("previous_app_version", "0.1"); // always trigger if the previous app version is not in local storage
    const comparison = semanticVersionCompare(appversion, previous_version);
    if (comparison == 1 && comparison !== "") {
        // localStorage.setObject("previous_app_version", appversion);
        return true;
    } else if (comparison == 0) {
        return false;
    } else if (comparison == -1) {
        // in case of a downgrade, silently set the previous app version to the current version
        localStorage.setObject("previous_app_version", appversion);
    } else {
        alert(`Invalid version comparison between ${appversion} and ${previous_version}, outcome: ${comparison}`);
    }
}

// function to get the releases by tag names
async function getReleasesByTags(tags) {
    // call all tags in parallel, then wait for all to finish or any to reject
    return await Promise.all(
        tags.map(async (tag) => {
            return fetchAsync(`https://api.github.com/repos/fjwillemsen/NativeOverleaf/releases/tags/${tag}`);
        })
    );
}

async function showChangelogIfUpdated() {
    const previous_version = localStorage.getObject("previous_app_version", undefined);
    if (checkIfUpdated() == true) {
        if (lib_showdownjs_loaded != true) {
            await insertShowdownJS();
        }
        // get the tags of releases after the previous version
        const tags_after_previous = await getTagsAfter(previous_version);
        // get all releases after the previous version
        const releases = await getReleasesByTags(tags_after_previous);
        console.log(releases);
        const markdown_converter = new showdown.Converter();
        // for each release, extract the release notes in HTML form
        const all_releasenotes = releases
            .map((release) => {
                if (
                    lib_showdownjs_loaded != true ||
                    release == undefined ||
                    release.body == undefined ||
                    release.body == "" ||
                    release.name == undefined ||
                    release.name == "" ||
                    release.html_url == undefined ||
                    release.html_url == "" ||
                    release.tag_name == undefined ||
                    release.tag_name == ""
                ) {
                    console.error(`Can not retrieve release notes, contents: ${release}`);
                    return;
                }
                // get the release notes and convert images hosted by GitHub to their raw location
                let releasenotes_md = release.body;
                const releasenotes_images = releasenotes_md.match(/!\[.*\]\(.*github\.com.*\)/gim);
                if (releasenotes_images && releasenotes_images !== undefined && releasenotes_images.length > 0) {
                    releasenotes_images.forEach((github_image) => {
                        releasenotes_md = releasenotes_md.replace(
                            github_image,
                            github_image.replace("/blob/", "/raw/")
                        );
                    });
                }
                // convert the release notes from MarkDown format to HTML
                const releasenotes = markdown_converter.makeHtml(releasenotes_md);
                return `
                    <div>
                        <p><i>Release notes of </i>${release.name}:</p>
                        ${releasenotes}
                        <a href="${release.html_url}">View release online</a>
                        <hr/>
                    </div>`;
            })
            .join("");
        // show the release notes in a dialog
        const updated_to_text = previous_version !== undefined ? `from version ${previous_version} to` : "to version";
        const versions_in_between =
            releases.length > 1 ? `<p style="font-size: 1.2em;">Release notes of ${releases.length} versions:</p>` : "";
        const changelog_html = `
            <p style="font-size: 1.5em;">🥳 Updated ${updated_to_text} ${tagToVersion(releases[0].tag_name)}</p>
            <div>
                ${versions_in_between}
                <hr/>
                ${all_releasenotes}
            </div>
            <a href="https://github.com/fjwillemsen/NativeOverleaf/releases">View all releases online</a>`;
        const dialog = injectDialog("updatechangelogdialog", changelog_html);
        dialog.showModal();
    }
}

// export functions for unit testing
if (typeof exports !== "undefined") {
    module.exports = { fetchAsync, semanticVersionCompare };
}
