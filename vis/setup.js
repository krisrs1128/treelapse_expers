width = 200;
height = 300;

tree_cluster = get_node_cluster(tree, width, height);

svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height});

paddings = {"y_top": 10, "y_bottom": 10, "x_right": 10, "x_left": 10};

vis_extent = {"height": height, "width": .75 * width}

x_values = tree_cluster.nodes.map(function(d) { return d.x });
y_values = tree_cluster.nodes.map(function(d) { return d.y });
data_extent = {"x": d3.max(y_values), "y": d3.max(x_values)}

scales = get_scales(data_extent, vis_extent, paddings);

times = Object.keys(abund);
cur_abund = abund[times[0]];
for (var otu_id in cur_abund) {
  cur_abund[otu_id] = cur_abund[otu_id][0];
}

link_data = insert_link_abund(tree_cluster.links, cur_abund);
node_data = insert_node_abund(tree_cluster.nodes, cur_abund);
draw_links(svg_elem, link_data, scales);
draw_nodes(svg_elem, tree_cluster.nodes, scales);

tips = get_tips(tree_cluster.nodes);
bounds = get_ts_bounds(tips, scales, .75 * width, width);
draw_tip_ts(svg_elem, abund_ts["10032"], tips, bounds);
