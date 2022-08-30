// This file is not intended to run by itself, but is inserted into main.js

let wordcountchart;
let wordcountchartdialog;
let wordcountchart_show_net_wordcount = true; // whether to show the net wordcount or total wordcount

// function to retrieve the library
async function insertChartJS() {
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
    const chart_html = `
            <p>Word count overview per day</p>
            <label class="settings-toggle">
                <input id="show_net_wordcount" class="settings-toggle-checkbox" type="checkbox">
                <div class="settings-toggle-switch"></div>
                <span class="settings-toggle-label">Net number of words written</span>
            </label>
            <div>
                <canvas id="wordcountchart"></canvas>
            </div>`;
    const dialog = injectDialog("wordcountchartdialog", chart_html, "#chat-wrapper");
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

    // default config format
    let config = {
        type: "bar",
        data: {
            labels: labels,
            datasets: [],
        },
        options: {},
    };

    // get the labels and data
    if (wordcounts == undefined || Object.keys(wordcounts).length <= 0) {
        alert(
            "Wordcounts have not been tracked or have not properly loaded, check that wordcount tracking is enabled and recompile the PDF"
        );
        return config;
    }
    const wordcounts_project = wordcounts[this.project_id];
    for (const [date, wordcount] of Object.entries(wordcounts_project)) {
        labels.push(date);
        const count =
            wordcountchart_show_net_wordcount == true ? wordcount.latest - wordcount.earliest : wordcount.latest;
        counts.push(count);
    }

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
    await insertChartJS();
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
