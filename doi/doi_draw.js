//////////////////////////////////////////////////////////////////////
// Functions to calculate degree-of-interest related quantities. We
// are following http://vis.stanford.edu/papers/doitrees-revisited
//////////////////////////////////////////////////////////////////////

var height = 500,
    width = 500
var node_size = [4, 40]

var nodes = d3.layout.cluster()
    .nodeSize(node_size)
    .nodes(tax_tree); // this actually modifies the tax tree variable

var res = tree_block(tax_tree, "F:F:Micrococcaceae", -10,
		     [width, height], node_size);
nodes = res.nodes;

var x_extent = d3.extent(nodes.map(function(d) { return d.x }));
for (var i = 0; i < nodes.length; i++) {
  nodes[i].x += (x_extent[1] - x_extent[0]) / 2
  nodes[i].y = nodes[i].depth * node_size[1];
}

var links = d3.layout.cluster()
    .links(nodes)
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]})

// just draw it for fun
var svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height})

d3.select("svg")
  .selectAll(".tree_link")
  .data(links).enter()
  .append("path", "g")
  .classed("tree_link", true)
  .attr({"d": function(d) {
    var source = {"x": d.source.x, "y": d.source.y}
    var target = {"x": d.target.x, "y": d.target.y}
    return diagonal({"source": source, "target": target})
  }})

var colScale = d3.scale.ordinal()
    .domain([-10, 0])
    .range(["#F88E79","#FA8B8C","#F58CA0","#EA90B3","#D997C4","#C29FD0","#A6A7D8","#87AFD9","#67B5D4","#4BBAC8","#3ABDB8","#3EBFA3"])

d3.select("svg")
  .selectAll(".tree_node")
  .data(nodes).enter()
  .append("circle")
  .classed("tree_node", true)
  .attr({"cx": function(d) { return d.x },
	 "cy": function(d) { return d.y},
	 "r": 2,
	 "fill": function(d) { return colScale(d.doi) }});
