
function get_node_cluster(tree, width, height) {
  var cluster = d3.layout.cluster()
	.size([height, width]);
  var nodes = cluster.nodes(tree);
  var links = cluster.links(nodes);
  return {"cluster": cluster, "nodes": nodes, "links": links};
}

function get_scales(data_extent, vis_extent, paddings) {
  var scales = {"y": d3.scale.linear() // height along the phylo (y) is width on the screen (x)
		.domain([0, data_extent.x])
		.range([paddings.x_left, vis_extent.width - paddings.x_right]),
		"x": d3.scale.linear() // width on the phylo
		.domain([0, data_extent.y])
		.range([paddings.y_top, vis_extent.height - paddings.y_bottom]),
		"edge": d3.scale.linear()
		.domain([0, data_extent.r])
		.range([0.5, 12]),
		"r": d3.scale.linear()
		.domain([0, data_extent.r])
		.range([0, 15])
	       };
  return scales;
}

function draw_nodes(svg_elem, node_data, scales) {
  node_selection = svg_elem.selectAll(".treeNode")
    .data(node_data, function(d) {  return d.name; });

  // remove exiting points
  node_selection.exit().remove();

  // draw new nodes for first time
  node_selection.enter()
    .append("circle")
    .classed("treeNode", true)
    .attr({"cx": function(d) { return scales.y(d.depth); },
	   "cy": function(d) { return scales.x(d.x); },
	   "r": function(d) { return scales.r(d.abund); }});

  // update attributes of existing nodes
  node_selection.transition()
    .duration(700)
    .attr({"r": function(d) { return scales.r(d.abund); }});
}

function insert_link_abund(links, abund) {
  // only need to insert abundance information for the target
  for (var i = 0; i < links.length; i++) {
    links[i].target.abund = abund[links[i].target.name];
  }
  return links;
}

function insert_node_abund(nodes, abund) {
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].abund = abund[nodes[i].name];
  }
  return nodes;
}

function draw_links(svg_elem, links, scales) {
  link_array = links.map(function(x) { return [x.source, x.target]; });
  link_id_fun = function(d) { return d[0].name + "_" + d[1].name; };

  link_selection = svg_elem.selectAll(".treeEdge")
    .data(link_array, link_id_fun);

  // remove exiting points
  link_selection.exit().remove();

  var line_fun = d3.svg.line()
      .x(function(d) { return scales.y(d.depth); })
      .y(function(d) { return scales.x(d.x); })
      .interpolate("step-before");

  link_selection.enter()
    .append("path")
    .classed("treeEdge", true)
    .attr({"d": line_fun})
    .style({"stroke-width": function(d) { return scales.edge(d[1].abund); }});

  link_selection.transition()
    .duration(700)
    .style({"stroke-width": function(d) { return scales.edge(d[1].abund); }});
}

function get_tips(nodes) {
  tip_nodes = [];
  for(var i = 0; i < nodes.length; i++) {
    if(nodes[i].children == null) {
      tip_nodes.push(nodes[i]);
    }
  }
  return tip_nodes;
}

function mean_over_times(abund, time_extent) {
  cur_abund = {};
  for (var key in abund) {
    cur_abund[key] = 0;
    denom = 0;
    for (var i = 0; i < abund[key].length; i++) {
      if (abund[key][i].time >= time_extent[0] &
	  abund[key][i].time <= time_extent[1]) {
	cur_abund[key] += abund[key][i].value;
	denom += 1.0;
      }
    }
    cur_abund[key] = cur_abund[key] / denom;
  }
  return cur_abund;
}

function draw_phylo(svg_elem, abund, time_extent, tree_cluster, scales) {
  cur_abund = mean_over_times(abund, time_extent);
  node_data = insert_node_abund(tree_cluster.nodes, cur_abund);
  link_data = insert_link_abund(tree_cluster.links, cur_abund);
  draw_links(svg_elem, link_data, scales);
  draw_nodes(svg_elem, node_data, scales);
}
