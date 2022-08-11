const backup_types = ["Source", "PDF"];
let up_backup = true;
let up_backup_type = 0;

// function to get the backup element from the webpage
function getBackupElement(backup_type_index) {
    if (document.querySelector("#left-menu")) {
        const backup_source_html = document
            .querySelector("#left-menu")
            .getElementsByClassName("nav-downloads")[0]
            .getElementsByTagName("li")[backup_type_index];
        if (backup_source_html !== undefined && backup_source_html.getElementsByTagName("a").length > 0) {
            return backup_source_html.getElementsByTagName("a")[0];
        }
    }
    return false;
}

// function to get the link to the backup
function getBackupLink(backup_type_index) {
    const backup_element = getBackupElement(backup_type_index);
    if (backup_element != "") {
        return backup_element.href;
    }
    return "";
}

function isPDFLinkAvailable() {
    return getBackupElement(1);
}

function doBackup() {
    getBackupLink(up_backup_type);
    // use IndexedDB to write the backups in the background (because localstorage is too small), show an overview in the settings pane where users can download a backup
}

// function setupBackup() {}
