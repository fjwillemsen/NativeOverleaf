// keep the ID of the interval timer so it can be removed later on
let wordcount_timer_id;

// recursively check whether the PDF has been compiled with four attempts accross an increasing waittime
async function waitUntilPDFCompiled() {
    return await recursiveCheckAndWait(isPDFLinkAvailable, 500, 5, true);
}

// extracts the word count from the modal if it is visible
function extractWordCount() {
    const modal = document.getElementById("clone-project-modal");
    if (modal && modal !== undefined) {
        const modaltext = modal.outerText;
        const wordcount = modaltext.substring(
            modaltext.lastIndexOf("\nTotal Words:\n") + 14,
            modaltext.lastIndexOf("\nHeaders:")
        );
        const parsedWordCount = parseInt(wordcount);
        if (isNaN(parsedWordCount) == false) {
            return parsedWordCount;
        }
    }
    return false;
}

// summons and waits for the modal to finish loading, then extracts the wordcount
async function getWordCount() {
    let wordcount_el = angular.element("[ng-controller=WordCountModalController]");
    if (wordcount_el && wordcount_el !== undefined && wordcount_el.scope !== undefined) {
        let wordcount_scope = wordcount_el.scope();

        if (wordcount_scope !== undefined && (await waitUntilPDFCompiled()) == true) {
            wordcount_scope.openWordCountModal();

            // check if the wordcount is loaded in quick successions, 100 attempts with a timeout of 50ms
            const wordcount = await recursiveCheckAndWait(extractWordCount, 50, 100);
            wordcount_scope.handleHide();
            if (wordcount == false) {
                console.warn("Unable to get wordcount within 5 seconds, skipping");
                return;
            }
            return wordcount;
        }
    }
}

// retrieve the wordcounts from local storage and add the keys where necessary
function getWordCounts() {
    let wordcounts = localStorage.getObject("wordcounts") || {};
    if (!(this.project_id in wordcounts)) {
        wordcounts[this.project_id] = {};
    }
    const currentdate = getLocalDate();
    if (!(currentdate in wordcounts[this.project_id])) {
        wordcounts[this.project_id][currentdate] = {
            earliest: undefined,
            latest: undefined,
            hasbeennotified: false,
        };
    }
    return wordcounts;
}

// reset the wordcount history (in case you change your system's date / cross the international dateline)
function resetWordCounts() {
    return localStorage.removeItem("wordcounts");
}

// update the wordcount
async function updateWordCount() {
    const currentdate = getLocalDate();
    let wordcounts = getWordCounts();
    const wordcount = await getWordCount();
    const hasbeennotified = wordcounts[this.project_id][currentdate].hasbeennotified;
    if (wordcount === undefined) {
        return;
    }

    // if the earliest wordcount is not defined, use the previous latest wordcount
    if (wordcounts[this.project_id][currentdate].earliest === undefined) {
        wordcounts[this.project_id][currentdate].earliest =
            wordcounts[this.project_id][currentdate].latest || wordcount;
    }
    // update the latest wordcount
    wordcounts[this.project_id][currentdate].latest = wordcount;
    const achieved_wordcount = wordcount - wordcounts[this.project_id][currentdate].earliest;

    // notify the user if the target number of words are reached
    if (hasbeennotified == false && achieved_wordcount >= up_wordcount_dailytarget) {
        new Notification("Awesome, already met today's target!", {
            body: `You wrote ${achieved_wordcount} words, ${
                achieved_wordcount - up_wordcount_dailytarget
            } above target!`,
        });
        wordcounts[this.project_id][currentdate].hasbeennotified = true;
    }

    // notify the user if the target time is reached
    if (hasbeennotified == false && up_wordcount_notificationhour !== undefined) {
        const currenttime = new Date();
        if (currenttime.getHours() == up_wordcount_notificationhour) {
            if (currenttime.getMinutes() <= up_wordcount_interval) {
                if (achieved_wordcount < up_wordcount_dailytarget) {
                    new Notification("You failed to meet today's target", {
                        body: `You wrote ${achieved_wordcount} out of ${up_wordcount_dailytarget} words.`,
                    });
                } else {
                    new Notification("Congrats, you met today's target!", {
                        body: `You wrote ${achieved_wordcount} words, ${
                            achieved_wordcount - up_wordcount_dailytarget
                        } above target!`,
                    });
                }
                wordcounts[this.project_id][currentdate].hasbeennotified = true;
            }
        }
    }

    // save the update object to the localstorage
    localStorage.setObject("wordcounts", wordcounts);
}

// set the hasBeenNotified field to the boolean value
function setHasBeenNotified(value) {
    const currentdate = getLocalDate();
    let wordcounts = getWordCounts();
    wordcounts[this.project_id][currentdate].hasbeennotified = value;
}

// setup the repeated execution of updateWordCount
function setupWordCount() {
    if (up_wordcount_tracking == true) {
        if (this.project_id === undefined) {
            console.warn("Project ID is not defined, unable to keep word count");
            return;
        }
        updateWordCount();
        wordcount_timer_id = setInterval(updateWordCount, up_wordcount_interval * 60 * 1000);
    }
}

// stop the repeated execution of updateWordCount
function destructWordCount() {
    if (up_wordcount_tracking == false && wordcount_timer_id !== undefined) {
        clearInterval(wordcount_timer_id);
    }
}