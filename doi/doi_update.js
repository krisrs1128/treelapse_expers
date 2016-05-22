
function doi_update(tree_var, display_dim, node_size) {
  var layout = tree_block(tree_var, focus_node_id, min_doi,
			  display_dim, node_size);
  
  var links = d3.layout.cluster()
    .links(layout.nodes)
  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]})
  
  var link_selection = d3.select("svg")
      .selectAll(".tree_link")
      .data(links, function(d) {
	return d.source.name + "-" + d.target.name
      })

  var node_selection = d3.select("svg")
      .selectAll(".tree_node")
      .data(layout.nodes, function(d) { return d.name })
  link_selection.exit().remove()
  node_selection.exit().remove()

  // enter links and nodes that haven't been entered yet
  link_selection.enter()
    .append("path", "g")
    .classed("tree_link", true)
    .style({"opacity": 0})

  var col_scale = d3.scale.linear()
      .domain([-7, 0])
      .range(["#F88E79", "#3EBFA3"])

  node_selection.enter()
    .append("circle")
    .classed("tree_node", true)
    .style({"opacity": 0,
	    "fill": function(d) {
	      return col_scale(d.doi) }})
    .on("click",
	function(d) {
	  focus_node_id = d.name;
	  doi_update(tax_tree, display_dim, node_size);
	});

  link_selection
    .transition()
    .duration(1000)
    .attr({"d": function(d) {
      var source = {"x": d.source.x, "y": d.source.y}
      var target = {"x": d.target.x, "y": d.target.y}
      return diagonal({"source": source, "target": target})
    }})
    .style({"opacity": 1})
  
  node_selection
    .transition()
    .duration(1000)
    .attr({"cx": function(d) { return d.x },
	   "cy": function(d) { return d.y},
	   "r": 2})
    .style({"opacity": 1,
	    "stroke": "red",
	    "stroke-width": function(d) {
	      if(d.doi == 0) {
		return .5;
	      } else {
		return 0;
	      }},
	    "fill": function(d) {
	      return col_scale(d.doi) }});
}
