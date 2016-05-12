$(document).ready(function() {
    $('#find-industry').on('click', function() {
        getRecords();
    });

    // slider
    $("#date-slider").slider({
        ticks: [1, 10, 20, 30, 40, 50],
        ticks_positions: [1, 20, 40, 60, 80, 100],
        ticks_labels: ['2015-05-24', '2015-08-02', '2015-10-11', '2015-12-20', '2016-02-28', '2016-05-08'],
    });
    $("#date-slider").on("slideStop", function(slideEvt) {
        console.log(slideEvt.value);
    });
});


function getRecords() {
    var industry = $('#industry').val().split(' ').join('_').split('&').join('%26');
    var url = "/records?industry=" + industry;
//              "&date=" + date;
    console.log(url);
    $.ajax({
        url: url
    })
     .done(function(data) {
        var records = JSON.parse(data);
        console.log(records);
        activateD3(records);
     })
}

function activateD3(root){
    $('#chart svg').remove();
    var diameter = 960,
        format = d3.format(",d"),
        color = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#chart").append("svg")
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
      .data(bubble.nodes(classes(root))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return d.packageName; })
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

function bucketScore(score) {
  if (score < 21) {
    return "#EDFFBE";
  } else if ( 20 < score && score < 41 ) {
    return "#DBEEAA";
  } else if ( 40 < score && score < 61 ) {
    return "#B0C97C";
  } else if ( 60 < score && score < 81 ) {
    return "#99B363";
  } else {
    return "#799242";
  }
}

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(industry, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: bucketScore(node.average_score), className: node.category, value: node.count});
  }

  recurse(null, root);
  return {children: classes};
}

function showDetails(d) {
    console.log(d.value);
}
