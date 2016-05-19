//////////////////////////////////////////////////////////////////////
// Functions to calculate degree-of-interest related quantities. We
// are following http://vis.stanford.edu/papers/doitrees-revisited
//////////////////////////////////////////////////////////////////////

var tree = d3.layout.tree()
var nodes = tree.nodeSize([5, 15])
    .nodes(tax_tree) // this actually modifies the tax tree variable
    
var nodes_pos = {"x": nodes.map(function(d) { return d.x }),
		 "y": nodes.map(function(d) { return d.y })}

var links = tree.links(nodes)
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]})

var height = 500,
    width = 500

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

d3.select("svg")
  .selectAll(".tree_node")
  .data(nodes).enter()
  .append("circle")
  .classed("tree_node", true)
  .attr({"cx": function(d) { return d.x },
	 "cy": function(d) { return d.y},
	 "r": 2,
	 "fill": "#A4A7DA"})
