width = 500;
height = 250;

tree_cluster = get_node_cluster(tree, width, height);

svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height});

paddings = {"y_top": 25, "y_bottom": 25, "x_right": 25, "x_left": 25};
scales = get_scales(height, width, paddings);

times = Object.keys(abund);
cur_abund = abund[times[0]]
for (var otu_id in cur_abund) {
  cur_abund[otu_id] = cur_abund[otu_id][0]
}

link_data = get_link_data(tree_cluster["links"], cur_abund); // displaying abundance at time 0
node_data = insert_node_abund(tree_cluster["nodes"], cur_abund);
draw_links(svg_elem, link_data, scales);
draw_nodes(svg_elem, tree_cluster["nodes"], scales);

//one_ts = abund_ts["10032"]["16054"]
//bounds = {"x_left": 10, "x_right": 50,
//	  "y_top": 50, "y_bottom": 10}
//ts_pos = get_one_ts_pos(bounds, one_ts)
//draw_ts(svg_elem, [ts_pos])
