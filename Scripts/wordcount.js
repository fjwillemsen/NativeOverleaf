up_keepwordcount = true;
up_wordcountdailytarget = 200;

async function waitUntilPDFCompiled() {
  return await recursiveCheckAndWait(isPDFLinkAvailable, 2000, 3, true);
}

// extracts the word count from the modal if it is visible
function extractWordCount() {
  console.log("extract wordcount");
  const modal = document.getElementById("clone-project-modal");
  console.log(modal);
  if (modal && modal !== undefined) {
    const modaltext = modal.outerText;
    console.log(modaltext);
    const wordcount = modaltext.substring(
      modaltext.lastIndexOf("\nTotal Words:\n") + 14,
      modaltext.lastIndexOf("\nHeaders:")
    );
    console.log(wordcount);
    const parsedWordCount = parseInt(wordcount);
    console.log(parsedWordCount);
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
    up_keepwordcount == true &&
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

      //   //   wait 1 second after opening for the numbers to be there
      //   setTimeout(function () {
      //     extractWordCount();
      //     wordcount_scope.handleHide();
      //   }, 1000);
    }
  }
}

function setupWordCount() {
  const wordcount = getWordCount();
  // maybe use this.lastModified?
  // do a wordcount every 15 minutes
  // setInterval(getWordCount, 15 * 60 * 1000);
  // save it to localStorage.[this.project_id].[currentdate].latest
}

// reset the wordcount history (in case you change your system's date)
