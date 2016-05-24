
function doi_update() {
  var layout = tree_block(tree_var, focus_node_id, min_doi,
			  display_dim, node_size);

  var tmp = [];
  for (var otu_id in abund_var) {
    for (var time_id in abund_var[otu_id]) {
      tmp.push(abund_var[otu_id][time_id].value);
    }
  }
  var max_abund = d3.max(tmp);
  var scales = {"size": d3.scale.linear()
		.domain([0, max_abund])
		.range([.7, 13])};

  var links = d3.layout.cluster()
    .links(layout.nodes)
  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]})
  
  var link_selection = d3.select("#links")
      .selectAll(".tree_link")
      .data(links, function(d) {
	return d.source.name + "-" + d.target.name
      })

  var node_selection = d3.select("#nodes")
      .selectAll(".tree_node")
      .data(layout.nodes, function(d) { return d.name })

  var text_selection = d3.select("#text")
      .selectAll(".tree_text")
      .data(layout.nodes.filter(function(d) { return d.doi >= -1}),
	    function(d) { return d.name });

  link_selection.exit().remove();
  node_selection.exit().remove();
  text_selection.exit().remove();

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
    .attr({"id": function(d) { return "node-" + d.name; }})
    .style({"opacity": 0,
	    "fill": function(d) {
	      return col_scale(d.doi) }})
    .on("click",
	function(d) {
	  focus_node_id = d.name;
	  doi_update();
	});

  text_selection.enter()
    .append("text")
    .classed("tree_text", true)
    .style({"opacity": 0});

  link_selection
    .transition()
    .duration(1000)
    .attr({"d": function(d) {
      var source = {"x": d.source.x, "y": d.source.y}
      var target = {"x": d.target.x, "y": d.target.y}
      return diagonal({"source": source, "target": target})
    }})
    .style({"opacity": 1,
	    "stroke-width": function(d) {
	      var abunds = get_abunds(abund_var, d.target.name); 
	      return .66 * scales.size(d3.mean(abunds));
	    }})

  node_selection
    .transition()
    .duration(1000)
    .attr({"cx": function(d) { return d.x },
	   "cy": function(d) { return d.y},
	   "r": function(d) {
	     var abunds = get_abunds(abund_var, d.name); 
	     return scales.size(d3.mean(abunds));
	   }})
    .style({"opacity": 1,
	    "stroke": "red",
	    "stroke-width": function(d) {
	      if(d.doi == 0) {
		return .5;
	      } else {
		return 0;
	      }},
	    "fill": function(d) {
	      var abunds = get_abunds(abund_var, d.name);
	      if (d3.mean(abunds) == 0) {
		return "black"
	      }
	      return col_scale(d.doi)
	    }});

  text_selection
    .transition()
    .duration(1000)
    .text(function(d) { return d.name })
    .attr({"x": function(d) {
      var abunds = get_abunds(abund_var, d.name); 
      var r = scales.size(d3.mean(abunds));
      return d.x + 1.75 * Math.sqrt(r);
    },
	   "y": function(d) {
	     var abunds = get_abunds(abund_var, d.name); 
	     var r = scales.size(d3.mean(abunds));
	     return d.y - 1.75 * Math.sqrt(r);
	   },
	   "font-size": function(d) {
	     if(d.doi == 0) {
	       return 7
	     } else {
	       return 5
	     }}})
    .style({"opacity":  function(d) {
	     if(d.doi == 0) {
	       return 1
	     } else {
	       return .6
	     }}});

}
