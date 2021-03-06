
function tb_update() {
  var abund_var = jQuery.extend(true, {}, tax_abund["10101"]);
  var line_fun = d3.svg.line()
      .x(function(d) {
	return scales.x(d.time); })
      .y(function(d) {
	return scales.y(d.value); });
  
  var ts_selection = d3.select("#all_ts")
      .selectAll(".ts_line")
      .data(Object.keys(abund_var),
	    function(d) { return d; });

  var link_selection = d3.select("#links")
      .selectAll(".tree_link")
      .data(links, function(d) { return d.source.name + d.target.name });

  var node_selection = d3.select("#nodes")
      .selectAll(".tree_node")
      .data(nodes, function(d) { return d.name });

  ts_selection.exit().remove();
  link_selection.exit().remove();
  node_selection.exit().remove();

  ts_selection.enter()
    .append("path")
    .classed("ts_line", true)
    .attr({"d": function(d) {
      return line_fun(abund_var[d])
    }})
    .style({"stroke": "#696969",
	    "stroke-width": 0})
    .on("mouseover", function(d) {
      if (cur_lines.indexOf(d) != -1) {
	d_len = Object.keys(abund_var[d]).length;
	d3.select("#mouseover")
	  .attr({"transform": "translate(" + (width - 60) +
		 "," + (scales.y(abund_var[d][d_len - 1].value)) +  ")"});
	d3.select("text")
	  .text(d)
	  .attr({"font-size": 8});
	}
    })

  link_selection.enter()
    .append("path")
    .classed("tree_link", true)
    .attr({
      "d": function(d) {
	var source = {"x": scales.x_tree(d.source.x), "y": scales.y_tree(d.source.y)}
	var target = {"x": scales.x_tree(d.target.x), "y": scales.y_tree(d.target.y)}
	return diagonal({"source": source, "target": target})
      }
    })
    .style({"opacity": .4,
	    "stroke": "#696969",
	    "stroke-width": function(d) {
	      return scales.r(d3.mean(abund_var[d.target.name]
				      .map(function(x) { return x.value;  })))
	    }});
  
  node_selection.enter()
    .append("circle")
    .classed("tree_node", true)
    .attr({"cx": function(d) { return scales.x_tree(d.x) },
	   "cy": function(d) { return scales.y_tree(d.y) },
	   "r": function(d) {
	     return scales.r(d3.mean(abund_var[d.name]
				     .map(function(x) { return x.value;  })))
	   }})
    .style({"fill": "#696969"});

  ts_selection.transition()
    .duration(700)
    .style({
      "stroke": function(d) {
	if (cur_lines.indexOf(d) != -1) {
	  return "#2D869F";
	} else {
	  return "#696969";
	}
      },
      "stroke-width": function(d) {
	if (cur_lines.indexOf(d) != -1) {
	  return 1;
	} else {
	  return .1;
	}
      },
      "opacity": function(d) {
	if(cur_lines.indexOf(d) != -1) {
	  return .9
	} else {
	  return .5
	}
      }
    });

  node_selection.transition()
    .duration(700)
    .style({
      "fill": function(d) {
	if (cur_lines.indexOf(d.name) != -1) {
	  return "#2D869F"
	} else {
	  return "#696969";
	}
      },
    });
}
