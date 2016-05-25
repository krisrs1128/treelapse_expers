
function tb_update() {
  var abund_var = jQuery.extend(true, {}, tax_abund["19009"]);
  var line_fun = d3.svg.line()
      .x(function(d) {
	return scales.x(d.time); })
      .y(function(d) {
	return scales.y(d.value); });
  
  var ts_selection = d3.select("#all_ts")
      .selectAll(".ts_line")
      .data(Object.keys(abund_var),
	    function(d) { return d; });
  
  ts_selection.exit().remove();

  ts_selection.enter()
    .append("path")
    .classed("ts_line", true)
    .attr({"d": function(d) {
      return line_fun(abund_var[d])
    }})
    .style({"stroke": "#303030",
	    "stroke-width": 0});

  ts_selection.transition()
    .duration(200)
    .style({
      "stroke": function(d) {
	if (cur_lines.indexOf(d) != -1) {
	  return "#2D869F";
	} else {
	  return "#696969";
	}
      },
      "stroke-width": function(d) {
	if (cur_lines.indexOf(d) != -1) {
	  return .7;
	} else {
	  return .1;
	}
      },
      "alpha": function(d) {
	if(cur_lines.indexOf(d) != -1) {
	  return .8
	} else {
	  return .05
	}
      }
    });
}
