// d3.legend.js
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence

(function() {
d3.legend = function(g) {
  g.each(function() {
    var g= d3.select(this),
        items = {},
        svg = d3.select(g.property("nearestViewportElement")),
        legendPadding = g.attr("data-style-padding") || 5,
        lb = g.selectAll(".legend-box").data([true]),
        li = g.selectAll(".legend-items").data([true])

    lb.enter().append("rect").classed("legend-box",true)
    li.enter().append("g").classed("legend-items",true)

    svg.selectAll("[data-legend]").each(function() {
        var self = d3.select(this)
        items[self.attr("data-legend")] = {
          pos : self.attr("data-legend-pos") || this.getBBox().y,
          color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
        }
      })

    items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})
    var font_size = 18;

    li.selectAll("text")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("text")})
        .call(function(d) { d.exit().remove()})
        .attr("y",function(d,i) { return (i*font_size)+"px"})
        .attr("x","1em")
        .style("fill", "#000000")
        .style("font-size", font_size + "px")
        .text(function(d) { ;return d.key})

    li.selectAll("circle")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("circle")})
        .call(function(d) { d.exit().remove()})
        .attr("cy",function(d,i) { return i-0.25+"em"})
        .attr("cx",0)
        .attr("r",".7em")
        .style("fill",function(d) { console.log(d.value.color);return d.value.color})

    // Reposition and resize the box
    var lbbox = li[0][0].getBBox();
    var x_offset = 5;
    var y_offset = -290;
        li.selectAll("text").attr("x", x_offset + 15).attr("y", function(d,i) { return y_offset + font_size*i});
      li.selectAll("circle").attr("cx", x_offset).attr("cy",function(d,i) { return (y_offset - (font_size*.34)) + font_size*i})
    lb.attr("x",(lbbox.x-legendPadding)+x_offset)
        .attr("y",(lbbox.y-legendPadding+y_offset))
        .attr("height",(lbbox.height+2*legendPadding))
        .attr("width",(lbbox.width+2*legendPadding))
  })
  return g
}
})()