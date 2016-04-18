
function get_one_ts_pos(bounds, one_ts) {
  parse_date = d3.time.format("%Y-%m-%d").parse;
  for (var i = 0; i < one_ts.length; i++) {
    // sometimes automatically knows string is a date
    if (!(one_ts[i].time instanceof Date)) {
      one_ts[i].time = parse_date(one_ts[i].time);
    }
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
    .data(ts_pos, function(d) { return Math.random() + ""; }).enter()
    .append("path")
    .classed("tsPath", true)
    .attr({"d": line_fun});

  svg_elem.selectAll(".tsNode")
    .data(ts_pos[0], function(d) { return Math.random() + "";}).enter()
    .append("circle")
    .classed("tsNode", true)
    .attr({"cx": function(d) { return d.x; },
	   "cy": function(d) { return d.y; }})
}

function get_ts_bounds(tips, scales, left_bound, right_bound) {
  start_diff = [];
  for (var i = 1; i < tips.length; i++) {
    start_diff.push(scales.y(tips[i].x) - scales.y(tips[i - 1].x));
  }
  min_diff = d3.min(start_diff);
  
  ts_bounds = [];
  for (var i = 0; i < tips.length; i++) {
    ts_bounds.push({"x_left": left_bound, "x_right": right_bound,
		    "y_top": scales.y(tips[i].x),
		    "y_bottom": scales.y(tips[i].x) - min_diff})
  }
  return (ts_bounds);
}

function draw_tip_ts(svg_elem, abund_ts, tips, bounds) {
  for (var i = 0; i < tips.length; i++) {
    cur_ts = abund_ts[tips[i].name];
    ts_pos = get_one_ts_pos(bounds[i], cur_ts);
    draw_ts(svg_elem, [ts_pos]);
  }
}
