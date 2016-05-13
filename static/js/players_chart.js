$(document).ready(function () {

    $("#category-input").on("change", function (_) {
        getMarketShareData();
    });

    $('#find-industry-dashboard').on('click', function() {
        getDashboardBlocks();
    });

    getMarketShareData();
    activateD3();
});

function getDashboardBlocks() {
    var industry = $('#dashboard-industry').val().split(' ').join('_').split('&').join('%26');
    var url = "/get-dashboard?industry=" + industry;
    console.log(url);
    $.ajax({
        url: url
    })
     .done(function(data) {
        var record = JSON.parse(data);
        if (record.market_cap) {
            var market_cap = '$' + Math.round(record.market_cap / 1000000000)
        } else {
            var market_cap = '$--'
        }
        if (record.cap_raised) {
            var cap_raised = '$'+ Math.round(record.cap_raised / 1000000000)
        } else {
            var cap_raised = '$--'
        }
        if (record.forecast_spend) {
            var forecast = '$' + record.forecast_spend
        } else {
            var forecast = '$--'
        }
        if (record.cagr) {
            var cagr = record.cagr + '%'
        } else {
            var cagr = '--%'
        }
        $('#market-cap').text(market_cap);
        $('#cap-raised').text(cap_raised);
        $('#forecast').text(forecast);
        $('#cagr').text(cagr);
        $('.dashboard-header').text(record.industry);
     })
}

function getMarketShareData() {
    var subcategory = $('#category-input :selected').val()
    var url = "/market-share?subcategory=" + subcategory;
    console.log(url);
    $.ajax({
        url: url
    })
        .done(function (data) {
            var records = JSON.parse(data);
            console.log(records);
            activateD3(records);
        })
}


function activateD3(dataset) {
    var chartCanvas = '#chart-container';
    $(chartCanvas).empty();

    var width = 1100;
    var height = 1100;
    var radius = Math.min(width, height) / 2;

    var color = d3.scale.category20b();

    var svg = d3.select(chartCanvas)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');

    var arc = d3.svg.arc()
        .outerRadius(radius);

    var pie = d3.layout.pie()
        .value(function (d) {
            return d.market_share;
        })
        .sort(null);

    var path = svg.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr("data-legend", function (d) {
            return d.data.company_name
        })
        .attr('d', arc)
        .attr('fill', function (d, i) {
            return color(d.data.company_name);
        });

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(50,30)")
        .style("font-size", "12px")
        .style("color", "black")
        .style("fill", "white")
        .call(d3.legend);

}