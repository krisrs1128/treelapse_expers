width = 800;
height = 800;

// only worry about one person right now
abund = parse_times(abund["10032"]);
svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height});
svg_elem.append("rect")
  .attr({"width": width,
	 "height": height,
	 "fill": "#F7F7F7"});
svg_elem.append("g")
  .attr("id", "links")
svg_elem.append("g")
  .attr("id", "nodes")
svg_elem.append("g")
  .attr("id", "tip_ts")
svg_elem.append("g")
  .attr("id", "tip_brushes")

// just to get scales 
paddings = {"y_top": 10, "y_bottom": 10, "x_right": 10, "x_left": 20};
vis_extent = {"height": height, "width": 0.75 * width};
abund_array = [];
for (var key in abund) {
  for (var i = 0; i < abund[key].length; i++) {
    abund_array.push(abund[key][i].value);
  }
}

init_cluster = get_node_cluster(tree, width, height);
update_depth()
