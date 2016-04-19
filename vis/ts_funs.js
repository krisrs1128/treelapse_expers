
function parse_times(ts_collection) {
  parser = d3.time.format("%m-%d-%Y").parse;
  for (var ts_key in ts_collection) {
    one_ts = ts_collection[ts_key];
    for (var i = 0; i < ts_collection[ts_key].length; i++) {
      // sometimes automatically knows string is a date
      if (!(ts_collection[ts_key][i].time instanceof Date)) {
	ts_collection[ts_key][i].time = parser(ts_collection[ts_key][i].time);
      }
    }
  }
  return ts_collection;
}

function get_one_ts_pos(bounds, ts_extents, one_ts, series_name) {
  ts_scale = {"x": d3.scale.linear()
	      .domain(ts_extents.time)
	      .range([bounds.x_left, bounds.x_right]),
	      "y": d3.scale.linear()
	      .domain(ts_extents.value)
	      .range([bounds.y_top, bounds.y_bottom])};

  ts_pos = [];
  for (var i = 0; i < one_ts.length; i++) {
    ts_pos.push({"x": ts_scale.x(one_ts[i].time),
		 "y": ts_scale.y(one_ts[i].value),
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
    .data(ts_pos, function(d) { return d[0].series_name; }).enter()
    .append("path")
    .classed("tsPath", true)
    .attr({"d": line_fun});
}

function get_ts_bounds(tips, ts_scale, left_bound, right_bound) {
  start_diff = [];
  for (var i = 1; i < tips.length; i++) {
    start_diff.push(ts_scale.x(tips[i].x) - ts_scale.x(tips[i - 1].x));
  }
  min_diff = d3.min(start_diff);
  
  ts_bounds = [];
  for (var i = 0; i < tips.length; i++) {
    ts_bounds.push({"x_left": left_bound, "x_right": right_bound,
		    "y_top": ts_scale.x(tips[i].x),
		    "y_bottom": ts_scale.x(tips[i].x) - min_diff});
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

function draw_ts_brush(svg_elem, time_extent, height, bounds, scales) {
  var brush;
  function brushed() {
    var extent_start = brush.extent();
    var extent_end = extent_start;
    if (d3.event.mode === "move") {
      var d_start = d3.time.day.round(extent_start[0]);
      var d_end = d3.time.day.round(extent_start[1]);
      extent_end = [d_start, d_end];
    }
    d3.select(this).call(brush.extent(extent_end));

    // these are globals...
    draw_phylo(svg_elem, abund, extent_end, tree_cluster, scales);
  }

  var x_scale = d3.time.scale()
      .domain(ts_extents.time)
      .range([bounds.x_left, bounds.x_right]);

  brush = d3.svg.brush()
    .x(x_scale)
    .extent([ts_extents.time[0], ts_extents.time[1]])
    .on("brush", brushed);

  var brush_elem = svg_elem.append("g")
      .classed("brush", true)
      .call(brush)
      .selectAll("rect")
      .attr({"height": height});
}
