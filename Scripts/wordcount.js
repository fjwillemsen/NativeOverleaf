up_keepwordcount = true;
up_wordcountinterval = 15;
up_wordcountdailytarget = 200;
up_wordcountnotifyhour = 20;

let wordcounts;
let wordcount_timer_id;

async function waitUntilPDFCompiled() {
  return await recursiveCheckAndWait(isPDFLinkAvailable, 2000, 3, true);
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

async function getWordCount() {
  let wordcount_el = angular.element(
    "[ng-controller=WordCountModalController]"
  );
  if (
    wordcount_el &&
    wordcount_el !== undefined &&
    wordcount_el.scope !== undefined
  ) {
    let wordcount_scope = wordcount_el.scope();

    if (
      wordcount_scope !== undefined &&
      (await waitUntilPDFCompiled()) == true
    ) {
      //   console.log(wordcount_scope);
      wordcount_scope.openWordCountModal();
      //   console.log("wordcount: ");
      //   extractWordCount();
      //   wordcount_scope.handleHide();

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

// reset the wordcount history (in case you change your system's date)
function resetWordCounts() {
  return localStorage.removeItem("wordcounts");
}

function getEarliestWordCount() {
  const wordcounts = getWordCount();
}

function saveLatestWordCount(wordcounts) {
  if (this.project_id in wordcounts) {
    const currentdate = getLocalDate();
    if (!(currentdate in wordcounts[this.project_id])) {
    }
    return localStorage.setObject("wordcounts", wordcounts);
  }
  console.error("Unable to save wordcount, project ID not in object");
}

function updateWordCount() {
  const currentdate = getLocalDate();
  let wordcounts = getWordCounts();
  const wordcount = getWordCount();
  const hasbeennotified =
    wordcounts[this.project_id][currentdate].hasbeennotified;
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
  const achieved_wordcount =
    wordcount - wordcounts[this.project_id][currentdate].earliest;

  // notify the user if the target number of words are reached
  if (
    hasbeennotified == false &&
    achieved_wordcount >= up_wordcountdailytarget
  ) {
    new Notification("Awesome, already met today's target!", {
      body: `You wrote ${achieved_wordcount} words, ${
        achieved_wordcount - up_wordcountdailytarget
      } above target!`,
    });
    wordcounts[this.project_id][currentdate].hasbeennotified = true;
  }

  // notify the user if the target time is reached
  if (hasbeennotified == false && up_wordcountnotifyhour !== undefined) {
    const currenttime = new Date();
    if (currenttime.getHours() == up_wordcountnotifyhour) {
      if (currenttime.getMinutes() <= up_wordcountinterval) {
        if (achieved_wordcount < up_wordcountdailytarget) {
          new Notification("You failed to meet today's target", {
            body: `You wrote ${achieved_wordcount} out of ${up_wordcountdailytarget} words.`,
          });
        } else {
          new Notification("Congrats, you met today's target!", {
            body: `You wrote ${achieved_wordcount} words, ${
              achieved_wordcount - up_wordcountdailytarget
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

function setupWordCount() {
  if (up_keepwordcount == true) {
    updateWordCount();
    wordcount_timer_id = setInterval(
      updateWordCount,
      up_wordcountinterval * 60 * 1000
    );
  }
}

function destructWordCount() {
  if (up_keepwordcount == false && wordcount_timer_id !== undefined) {
    clearInterval(wordcount_timer_id);
  }
}
