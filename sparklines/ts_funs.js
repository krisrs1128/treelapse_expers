
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

function get_ts_bounds(tips, ts_scale, width, padding = 10) {
  start_diff = [];
  for (var i = 1; i < tips.length; i++) {
    start_diff.push(ts_scale.x(tips[i].x) - ts_scale.x(tips[i - 1].x));
  }
  min_diff = d3.min(start_diff);
  
  ts_bounds = [];
  for (var i = 0; i < tips.length; i++) {
    ts_bounds.push({"x_left": ts_scale.y(tips[i].depth) + padding,
		    "x_right": ts_scale.y(tips[i].depth) + padding + width,
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

function get_ts_pos(abund_ts, tips, bounds) {
  var ts_array = [];
  cur_species = []
  ts_extents = get_ts_extent(abund_ts);
  for (var i = 0; i < tips.length; i++) {
    cur_ts = abund_ts[tips[i].name];
    cur_species.push(tips[i].name);
    one_ts_pos = get_one_ts_pos(bounds[i], ts_extents, cur_ts, tips[i].name);
    ts_array.push(one_ts_pos);
  }
  return {"ts": ts_array, "names": cur_species};
}

function draw_ts(elem_id, ts_pos, ts_names, highlighted_ix) {
  var line_fun = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
  
  ts_selection = d3.select(elem_id)
    .selectAll(".ts_path")
    .data(ts_pos, function(d, i) { return ts_names[i] });
  ts_selection.exit().remove()

  ts_selection.enter()
    .append("path")
    .classed("ts_path", true)
    .style({"opacity": 0})
      
  ts_selection.transition()
    .duration(700)
    .attr({"d": line_fun,
	   "stroke-width": function(d, i) {
	     if (highlighted_ix.indexOf(i) == -1) {
	       return .05;
	     } else {
	       return 1;
	     }
	   }
	  })
    .style({"opacity": 1})  
}

function draw_ts_brush(ts_extents, bounds, abund, cur_cluster, scales) {
  var brushes = [];
  function brushed() {
    var brush_ix = d3.select(this)
	.attr("id")
	.replace( /^\D+/g, '');
    var extent_start = brushes[brush_ix].extent();
    var extent_end = extent_start;
    if (d3.event.mode === "move") {
      var d_start = d3.time.day.round(extent_start[0]);
      var d_end = d3.time.day.round(extent_start[1]);
      extent_end = [d_start, d_end];
    }

    for (var i = 0; i < brushes.length; i++) {
      cur_elem = d3.select("#brush-" + i)
      cur_elem.call(brushes[i].extent(extent_end));
    }

    draw_phylo(abund, extent_end, cur_cluster, scales);
  }

  d3.select("#tip_brushes")
    .selectAll(".brush")
    .remove();
  for (var i = 0; i < bounds.length; i++) {
    var x_scale = d3.time.scale()
	.domain(ts_extents.time)
	.range([bounds[i].x_left, bounds[i].x_right]);
    cur_brush = d3.svg.brush()
      .x(x_scale)
      .extent(ts_extents.time)
      .on("brush", brushed);
    brushes.push(cur_brush);
    brush_elem = d3.select("#tip_brushes")
      .append("g")
      .classed("brush", true)
      .attr("id", "brush-" + i)
      .call(brushes[i])

    brush_elem.selectAll("rect")
      .attr({"height": 0,
	     "y": bounds[i].y_top})
      .transition()
      .duration(700)
      .attr({"height": bounds[i].y_top - bounds[i].y_bottom,
	     "y": bounds[i].y_bottom});
  }
}

function check_covered_line(ts, extent) {
  for (var i = 0; i < ts.length; i++) {
    var x_contained = (ts[i].x >= extent.x_left) && (ts[i].x <= extent.x_right);
    var y_contained = (ts[i].y <= extent.y_bottom) &&  (ts[i].y >= extent.y_top);
    if (x_contained && y_contained) {
      return true;
    }
  }
  return false;
}

function get_covered_lines(ts_array, extent) {
  covered_ix = [];
  for (var i = 0; i < ts_array.length; i++) {
    var covered = check_covered_line(ts_array[i], extent);
    if (covered) {
      covered_ix.push(i);
    }
  }
  return covered_ix;
}

function get_highlighted_ts(ts_array) {
  var brush_extent = box_brush.extent();
  var extent = {"x_left": brush_extent[0][0], "x_right": brush_extent[1][0],
		"y_top": brush_extent[0][1], "y_bottom": brush_extent[1][1]};
  var covered_ix = get_covered_lines(ts_array, extent);
  return covered_ix;
}

function draw_box_brush(bounds) {
  var x_scale = d3.scale.linear()
      .domain([bounds.x_left, bounds.x_right])
      .range([bounds.x_left, bounds.x_right]);
  var y_scale = d3.scale.linear()
      .domain([bounds.y_bottom, bounds.y_top])
      .range([bounds.y_bottom, bounds.y_top]);

  box_brush = d3.svg.brush()
    .x(x_scale)
    .y(x_scale)
    .extent([[0, 0], [100, 100]]);

  var brush_elem = d3.select("#box_brushes")
      .append("g")
      .classed("brush", true)
      .attr({"id": "box-brush-1"})
      .call(box_brush)
}
