
function parse_times(abund_ts) {
  parser = d3.time.format("%Y-%m-%d").parse;
  for (var ts_key in abund_ts) {
    one_ts = abund_ts[ts_key];
    for (var i = 0; i < abund_ts[ts_key].length; i++) {
      // sometimes automatically knows string is a date
      if (!(abund_ts[ts_key][i].time instanceof Date)) {
	abund_ts[ts_key][i].time = parser(abund_ts[ts_key][i].time);
      }
    }
  }
  return abund_ts;
}

function get_one_ts_pos(bounds, ts_extents, one_ts, series_name) {
  scales = {"x": d3.scale.linear()
	    .domain(ts_extents.time)
	    .range([bounds.x_left, bounds.x_right]),
	    "y": d3.scale.linear()
	    .domain(ts_extents.value)
	    .range([bounds.y_top, bounds.y_bottom])};

  ts_pos = [];
  for (var i = 0; i < one_ts.length; i++) {
    ts_pos.push({"x": scales.x(one_ts[i].time),
		 "y": scales.y(one_ts[i].value),
		 "series_name": series_name,
		 "node_name": series_name + one_ts[i].time});
  }
  return ts_pos;
}

function draw_ts(svg_elem, ts_pos) {
  var line_fun = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

  svg_elem.selectAll(".tsPath")
    .data(ts_pos, function(d) { return d.series_name; }).enter()
    .append("path")
    .classed("tsPath", true)
    .attr({"d": line_fun});

  svg_elem.selectAll(".tsNode")
    .data(ts_pos[0], function(d) { return d.node_name;}).enter()
    .append("circle")
    .classed("tsNode", true)
    .attr({"cx": function(d) { return d.x; },
	   "cy": function(d) { return d.y; }});
}

function get_ts_bounds(tips, scales, left_bound, right_bound) {
  start_diff = [];
  for (var i = 1; i < tips.length; i++) {
    start_diff.push(scales.x(tips[i].x) - scales.x(tips[i - 1].x));
  }
  min_diff = d3.min(start_diff);
  
  ts_bounds = [];
  for (var i = 0; i < tips.length; i++) {
    ts_bounds.push({"x_left": left_bound, "x_right": right_bound,
		    "y_top": scales.x(tips[i].x),
		    "y_bottom": scales.x(tips[i].x) - min_diff});
  }
  return (ts_bounds);
}

function get_ts_extent(ts_collection) {
  all_values = [];
  all_times = [];
  for (var key in ts_collection) {
    cur_values = ts_collection[key].map(function(d) { return d.value; });
    cur_times = ts_collection[key].map(function(d) { return d.time; });
    all_values = all_values.concat(cur_values);
    all_times = all_times.concat(cur_times);
  }

  return {"time": d3.extent(all_times), "value": d3.extent(all_values)};
}

function draw_tip_ts(svg_elem, abund_ts, tips, bounds) {
  ts_extents = get_ts_extent(abund_ts);
  for (var i = 0; i < tips.length; i++) {
    cur_ts = abund_ts[tips[i].name];
    ts_pos = get_one_ts_pos(bounds[i], ts_extents, cur_ts, tips[i].name);
    draw_ts(svg_elem, [ts_pos]);
  }
}
