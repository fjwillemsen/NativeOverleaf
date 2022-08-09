// function to retrieve the library
async function getChartJS() {
    if (lib_chartjs_loaded == true) {
        return;
    }
    return $.when($.getScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"))
        .done(() => {
            lib_chartjs_loaded = true;
        })
        .fail(() => {
            alert("Unable to dynamically load ChartJS, do you have an active internet connection?");
        });
    // $.getScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js")
    //     .done(function (script, textStatus) {
    //         console.log(textStatus);
    //         console.log(this);
    //         console.log(Chart);
    //     })
    // .fail(function (jqxhr, settings, exception) {
    //     alert("Unable to dynamically load ChartJS, do you have an active internet connection?");
    //     console.err(exception);
    // });
}

async function setupCharts() {
    console.log(`loaded: ${lib_chartjs_loaded}`);
    // don't load this by default
    await getChartJS();
    console.log(`loaded: ${lib_chartjs_loaded}`);
    console.log(Chart);
}
