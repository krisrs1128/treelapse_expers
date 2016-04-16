
function drawTS(svg_elem, ts_pos) {
  var lineFun = d3.svg.line()
      .x(function(d) { return scales.x(d.y); })
      .y(function(d) { return scales.y(d.x); });

  svg_elem.selectAll(".tsPath")
    .data(ts_pos).enter()
    .append("path")
    .classsed("tsPath", true)
    .attr("d", lineFun);
}
