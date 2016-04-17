
function get_node_cluster(tree, width, height) {
  var cluster = d3.layout.cluster()
	.size([height, width]);
  var nodes = cluster.nodes(tree);
  var links = cluster.links(nodes);
  return {"cluster": cluster, "nodes": nodes, "links": links};
}

function get_scales(height, width, paddings) {
  var scales = {"x": d3.scale.linear()
		.domain([0, width])
		.range([paddings.x_left, width - paddings.x_right]),
		"y": d3.scale.linear()
		.domain([0, height])
		.range([paddings.y_top, height - paddings.y_bottom]),
		"edge": d3.scale.linear()
		.domain([0, 200])
		.range([0.5, 5]),
		"r": d3.scale.linear()
		.domain([0, 200])
		.range([0, 5])
	       };
  return scales;
}

function draw_nodes(svg_elem, node_data, scales) {
  svg_elem.selectAll("circle")
    .data(node_data).enter()
    .append("circle")
    .classed("node", true)
    .attr({"cx": function(d) { return scales.x(d.y); },
	   "cy": function(d) { return scales.y(d.x); },
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
      .x(function(d) { return scales.x(d.y); })
      .y(function(d) { return scales.y(d.x); })
      .interpolate("step-before");

  link_array = links.map(function(x) { return [x.source, x.target]; });

  svg_elem.selectAll("path")
    .data(link_array).enter()
    .append("path")
    .classed("link", true)
    .attr({"d": lineFun})
    .style({"stroke-width": function(d) { return scales.edge(d[1].abund); }});
}
