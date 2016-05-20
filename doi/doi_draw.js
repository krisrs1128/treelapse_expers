//////////////////////////////////////////////////////////////////////
// Functions to calculate degree-of-interest related quantities. We
// are following http://vis.stanford.edu/papers/doitrees-revisited
//////////////////////////////////////////////////////////////////////

var tree = d3.layout.tree()
var nodes = tree.nodeSize([4, 10])
    .nodes(tax_tree); // this actually modifies the tax tree variable

tax_tree2 = segment_tree(tax_tree);
tax_tree2 = tax_tree;
nodes = tree.nodeSize([4, 50])
  .nodes(tax_tree2);
    
var nodes_pos = {"x": nodes.map(function(d) { return d.x }),
		 "y": nodes.map(function(d) { return d.y })}

var links = tree.links(nodes)

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]})

var height = 800,
    width = 1000

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
    .domain(d3.range(12))
    .range(["#F88E79","#FA8B8C","#F58CA0","#EA90B3","#D997C4","#C29FD0","#A6A7D8","#87AFD9","#67B5D4","#4BBAC8","#3ABDB8","#3EBFA3"])

d3.select("svg")
  .selectAll(".tree_node")
  .data(nodes).enter()
  .append("circle")
  .classed("tree_node", true)
  .attr({"cx": function(d) { return d.x },
	 "cy": function(d) { return d.y},
	 "r": 2,
	 "fill": function(d) { return colScale(d.segment) }});

test = segment_tree(tax_tree)
