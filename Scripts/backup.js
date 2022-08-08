backup_types = ["Source", "PDF"];
up_backup = true;
up_backup_type = 0;

function getBackupLink(backup_type_index) {
    if (document.querySelector("#left-menu")) {
        backup_source_html = document
            .querySelector("#left-menu")
            .getElementsByClassName("nav-downloads")[0]
            .getElementsByTagName("li")[backup_type_index];
        if (backup_source_html !== undefined && backup_source_html.getElementsByTagName("a").length > 0) {
            return backup_source_html.getElementsByTagName("a")[0].href;
        }
    }
    return "";
}

function isPDFLinkAvailable() {
    return getBackupLink(1) != "";
}

function doBackup() {
    getBackupLink(up_backup_type);
    // use IndexedDB to write the backups in the background, show an overview in the settings pane where users can download a backup
}

// function setupBackup() {}
