$(document).ready(function () {
    $('#find-industry').on('click', function () {
        getRecords();
        $("#date-slider").off().on("change", function (slideEvt) {
                getRecords();
                console.log(slideEvt.value);
            });
    });
    $('#find-category').on('click', function () {
        getRecordsbyCategory();
        $("#date-slider").off().on("change", function (slideEvt) {
            getRecordsbyCategory();
            console.log(slideEvt.value);
        });
    });
    $('#find-industry-dashboard').on('click', function() {
        getDashboardBlocks();
    })
    // slider
    createDateSlider();
});


function createDateSlider() {
    var url = "/dates";
    $.ajax({
        url: url
    })
        .done(function (data) {
            var number_of_dates = Number($('#date-slider').attr('data-number-of-dates'));
            var tick_list = Array.apply(null, Array(number_of_dates)).map(function (_, i) {
                return i;
            });
            var date_strings = JSON.parse(data);
            console.log(date_strings);
            $("#date-slider").slider({

                ticks: tick_list,
                value: number_of_dates,
                formatter: function (x) {
                    return date_strings[x]
                }
            });
            $("#date-slider").on("change", function (slideEvt) {
                getRecords();
                console.log(slideEvt.value);
            });
        })
}



function getRecords() {
    var industry = $('#industry').val().split(' ').join('_').split('&').join('%26');
    var date_index = $('#date-slider').attr('value');
    var url = "/records?industry=" + industry + "&date_index=" + date_index;
    console.log(url);
    $.ajax({
        url: url
    })
     .done(function(data) {
        var records = JSON.parse(data);
        console.log(records);
        activateD3(records, 'industry');
     })
}

function getRecordsbyCategory() {
    var category = $('#category').val().split(' ').join('_').split('&').join('%26');
    var date_index = $('#date-slider').attr('value');
    var url = "/records-by-category?category=" + category + "&date_index=" + date_index;
    console.log(url);
    $.ajax({
        url: url
    })
     .done(function(data) {
        var records = JSON.parse(data);
        console.log(records);
        activateD3(records, 'category');
     })
}

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

function activateD3(root, search_by){
    var chartContainer = '#' + search_by + '-chart';
    $(chartContainer).empty();
    var diameter = $(window).width(),
        format = d3.format(",d"),
        color = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select(chartContainer).append("svg")
        .attr("width", diameter + 400)
        .attr("height", diameter)
        .attr("class", "bubble");

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("border-radius", "6px")
        .style("font", "12px sans-serif")
        .text("tooltip");

    var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root, search_by))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return "hsl(120, 50%, " + ((d.average_score) + 38) + "%)"; })
      .on("mouseover", function(d) {
              tooltip.text(d.className + ": " + format(d.value));
              tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
          return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      })
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
//      .on("click", function(d) {
//          showDetails(d);
//          console.log(d.count);
//          console.log(d.average_score);
//      });

    node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .text(function(d) { return d.className.substring(0, d.r / 3); });

    d3.select(self.frameElement).style("height", diameter + "px");
}

// function bucketScore(score) {
  // if (score < 21) {
  //   return "#EDFFBE";
  // } else if ( 20 < score && score < 41 ) {
  //   return "#DBEEAA";
  // } else if ( 40 < score && score < 61 ) {
  //   return "#B0C97C";
  // } else if ( 60 < score && score < 81 ) {
  //   return "#99B363";
  // } else {
  //   return "#799242";
//   // }
// }

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root, search_by) {
  var classes = [];

  function recurse(search_by, industry, node) {
    var show = false;

    if (search_by === 'industry') {
      show = node.category;
    } else if (search_by === 'category') {
      show = node.industry;
    }

    if (node.children) node.children.forEach(function(child) { recurse(search_by, node.name, child); });
    else classes.push({average_score: node.average_score, className: show, value: node.count});
  }


  recurse(search_by, null, root);
  return {children: classes};
}

//function showDetails(d) {
//    var industry = d.industry;
//    var category = d.category;
//    var trendModal = $('#trend-modal');
//    getTrends(industry, category);
//    trendModal.modal('show');
//}

//function getTrends(industry, category) {
//    var url = "/records-trend?category=" + category +
//              "&industry=" + industry;
//    console.log(url);
//    $.ajax({
//        url: url
//    })
//     .done(function(data) {
//        var records = JSON.parse(data);
//        console.log(records);
//        InitChart(records);
//     })
//}
//
//// line chart of trend
//function InitChart(records) {
//    console.log('initializing line chart');
//    var vis = d3.select("#trend-chart"),
//        WIDTH = 500,
//        HEIGHT = 500,
//        MARGINS = {
//            top: 20,
//            right: 20,
//            bottom: 20,
//            left: 50
//        },
//        xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([2000, 2010]),
//        yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([134, 215]),
//        xAxis = d3.svg.axis()
//        .scale(xScale),
//        yAxis = d3.svg.axis()
//        .scale(yScale)
//        .orient("left");
//
//    vis.append("svg:g")
//        .attr("class", "x axis")
//        .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
//        .call(xAxis);
//    vis.append("svg:g")
//        .attr("class", "y axis")
//        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
//        .call(yAxis);
//    var lineGen = d3.svg.line()
//        .x(function(d) {
//            return xScale(d.date);
//        })
//        .y(function(d) {
//            return yScale(d.count);
//        })
//        .interpolate("basis");
//    vis.append('svg:path')
//        .attr('d', lineGen(records))
//        .attr('stroke', 'green')
//        .attr('stroke-width', 2)
//        .attr('fill', 'none');
//    var lineGen = d3.svg.line()
//        .x(function(d) {
//            return xScale(d.date);
//        })
//        .y(function(d) {
//            return yScale(d.average_score);
//        })
//    vis.append('svg:path')
//        .attr('d', lineGen(records))
//        .attr('stroke', 'blue')
//        .attr('stroke-width', 2)
//        .attr('fill', 'none');
//}
