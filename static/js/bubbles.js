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
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
      .on("click", function(d) {
          showDetails(d);
      });

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

function showDetails(d) {
    console.log(d.value);
}
