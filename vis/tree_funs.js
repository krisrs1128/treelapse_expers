
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
		.domain([0, data_extent.y])
		.range([0.5, 5]),
		"r": d3.scale.linear()
		.domain([0, data_extent.y])
		.range([0, 5])
	       };
  return scales;
}

function draw_nodes(svg_elem, node_data, scales) {
  svg_elem.selectAll("treeNode")
    .data(node_data, function(d) { return d.name; }).enter()
    .append("circle")
    .classed("treeNode", true)
    .attr({"cx": function(d) { return scales.y(d.y); },
	   "cy": function(d) { return scales.x(d.x); },
	   "r": function(d) { return scales.r(d.abund); }});
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
  var lineFun = d3.svg.line()
      .x(function(d) { return scales.y(d.y); })
      .y(function(d) { return scales.x(d.x); })
      .interpolate("step-before");

  link_array = links.map(function(x) { return [x.source, x.target]; });
  link_id_fun = function(d) { return d[0].name + "_" + d[1].name; };

  svg_elem.selectAll(".treeEdge")
    .data(link_array, link_id_fun).enter()
    .append("path")
    .classed("treeEdge", true)
    .attr({"d": lineFun})
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
