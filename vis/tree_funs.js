
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
		.range([0.5, 5])
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
    link_pos.push([{"x": links[i].source.x, "y": links[i].source.y,
		    "name": links[i].source.name},
		   {"x": links[i].target.x, "y": links[i].target.y,
		    "name": links[i].target.name}]);
  }
  return link_pos;
}

function get_link_data(links, abund) {
  var link_pos = extract_link_pos(links, abund);
  var link_data = insert_abund_data(link_pos, abund);
  return link_data;
}


function insert_abund_data(link_pos, abund) {
  // only need to insert abundance information for the target
  link_data = link_pos;
  for (var i = 0; i < link_pos.length; i++) {
    link_data[i][1].abund = abund[link_pos[i][1].name];
  }
  return link_data;
}

function draw_links(svg_elem, link_data, scales) {
  var lineFun = d3.svg.line()
      .x(function(d) { return scales.x(d.y); })
      .y(function(d) { return scales.y(d.x); })
      .interpolate("step-before");

  svg_elem.selectAll("path")
    .data(link_data).enter()
    .append("path")
    .classed("link", true)
    .attr({"d": lineFun})
    .style({"stroke-width": function(d) { return scales.edge(d[1].abund); }});
}

