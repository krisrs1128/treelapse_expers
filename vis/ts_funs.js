
function get_one_ts_pos(bounds, one_ts) {
  parse_date = d3.time.format("%Y-%m-%d").parse;
  for (var i = 0; i < one_ts.length; i++) {
    one_ts[i].time = parse_date(one_ts[i].time);
  }
  
  // to get the extent
  ts_x = one_ts.map(function(z) { return z.time; });
  ts_y = one_ts.map(function(z) { return z.value; });

  scales = {"x": d3.scale.linear()
	    .domain(d3.extent(ts_x))
	    .range([bounds.x_left, bounds.x_right]),
	    "y": d3.scale.linear()
	    .domain(d3.extent(ts_y))
	    .range([bounds.y_top, bounds.y_bottom])};

  ts_pos = [];
  for (var i = 0; i < one_ts.length; i++) {
    ts_pos.push({"x": scales.x(one_ts[i].time),
		 "y": scales.y(one_ts[i].value)});
  }
  return ts_pos;
}

function draw_ts(svg_elem, ts_pos) {
  var line_fun = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

  svg_elem.selectAll(".tsPath")
    .data(ts_pos).enter()
    .append("path")
    .classed("tsPath", true)
    .attr({"d": line_fun});
}
