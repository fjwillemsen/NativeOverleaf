// This file is not intended to run by itself, but is inserted into main.js

let wordcountchart;
let wordcountchartdialog;
let wordcountchart_show_net_wordcount = true; // whether to show the net wordcount or total wordcount

// function to retrieve the library
async function getChartJS() {
    $.ajaxSetup({ cache: true });
    return $.when($.getScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"))
        .done(() => {
            lib_chartjs_loaded = true;
        })
        .fail(() => {
            alert("Unable to dynamically load ChartJS, do you have an active internet connection?");
        });
}

function injectWordCountChartElement() {
    const chart_html = `<dialog id="wordcountchartdialog">
            <p>Word count overview per day</p>
            <label class="settings-toggle">
                <input id="show_net_wordcount" class="settings-toggle-checkbox" type="checkbox">
                <div class="settings-toggle-switch"></div>
                <span class="settings-toggle-label">Net number of words written</span>
            </label>
            <div>
                <canvas id="wordcountchart"></canvas>
            </div>
        </dialog>`;
    document.querySelector("#chat-wrapper").insertAdjacentHTML("afterend", chart_html);
    const dialog = document.querySelector("#wordcountchartdialog");
    // close the dialog if there is a click outside it
    dialog.addEventListener("click", function (event) {
        const rect = dialog.getBoundingClientRect();
        if (
            event.clientY < rect.top ||
            event.clientY > rect.bottom ||
            event.clientX < rect.left ||
            event.clientX > rect.right
        ) {
            dialog.close();
        }
    });
    // set the options with their default value
    document.getElementById("show_net_wordcount").checked = wordcountchart_show_net_wordcount;

    // reload the data if one of the options is changed
    document.getElementById("show_net_wordcount").addEventListener("change", () => {
        wordcountchart_show_net_wordcount = document.getElementById("show_net_wordcount").checked;
        updateWordCountChartData();
    });
    return dialog;
}

function getWordCountChartConfig() {
    let labels = [];
    let counts = [];

    // preferences
    const label = wordcountchart_show_net_wordcount == true ? "Net number of words written" : "Total number of words";

    // get the labels and data
    const wordcounts_project = wordcounts[this.project_id];
    for (const [date, wordcount] of Object.entries(wordcounts_project)) {
        labels.push(date);
        const count =
            wordcountchart_show_net_wordcount == true ? wordcount.latest - wordcount.earliest : wordcount.latest;
        counts.push(count);
    }

    // put it in config format
    let config = {
        type: "bar",
        data: {
            labels: labels,
            datasets: [],
        },
        options: {},
    };

    // add the daily target if applicable
    if (wordcountchart_show_net_wordcount == true && up_wordcount_dailytarget > 0) {
        config.data.datasets.push({
            label: "Daily target",
            data: Array(labels.length).fill(up_wordcount_dailytarget),
            type: "line",
            backgroundColor: "red",
            borderColor: "red",
        });
    }

    // add the data (after the daily target to draw it below)
    config.data.datasets.push({
        label: label,
        data: counts,
        backgroundColor: "#408827",
    });

    return config;
}

// update the data, used by wordcount.js
function updateWordCountChartData() {
    const config = getWordCountChartConfig();
    wordcountchart.data.labels = config.data.labels;
    wordcountchart.data.datasets = config.data.datasets;
    wordcountchart.update();
}

// show the modal with the chart
async function showWordCountChart() {
    // don't load this by default
    await getChartJS();
    if (wordcountchartdialog == undefined) {
        // initialize
        wordcountchartdialog = injectWordCountChartElement();
        wordcountchart = new Chart(document.getElementById("wordcountchart"), getWordCountChartConfig());
    }
    wordcountchartdialog.showModal();
}

function hideWordCountChart() {
    wordcountchartdialog.close();
}
