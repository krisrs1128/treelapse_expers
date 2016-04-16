
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
		.range([paddings.y_top, height - paddings.y_bottom])
	       };
  return scales;
}

function draw_nodes(svg_elem, nodes, scales) {
  svg_elem.selectAll("circle")
    .data(nodes).enter()
    .append("circle")
    .classed("node", true)
    .attr({"cx": function(d) { return scales.x(d.y); },
	   "cy": function(d) { return scales.y(d.x); },
	   "r": 2});
}

function extract_link_pos(links) {
  var link_pos = [];
  for (var i = 0; i < links.length; i++) {
    link_pos.push([{"x": links[i].source.x, "y": links[i].source.y},
		   {"x": links[i].target.x, "y": links[i].target.y}]);
  }
  return link_pos;
}

function draw_links(svg_elem, links, scales) {
  var lineFun = d3.svg.line()
      .x(function(d) { return scales.x(d.y); })
      .y(function(d) { return scales.y(d.x); })
      .interpolate("step-before");
  var link_pos = extract_link_pos(links);

  svg_elem.selectAll("path")
    .data(link_pos).enter()
    .append("path")
    .classed("link", true)
    .attr({"d": lineFun});
}

