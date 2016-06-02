
function doi_update() {
  var filtered_tree = filter_tree(jQuery.extend(true, {}, tree_var),
				  min_avg_abund);
  var layout = tree_block(filtered_tree, focus_node_id, min_doi,
			  display_dim, node_size);
  var group_ids = Object.keys(abund_vars);
  
  var tmp = [];
  for (var group_id in abund_vars) {
    for (var otu_id in abund_vars[group_id]) {
      for (var time_id in abund_vars[group_id][otu_id]) {
	tmp.push(abund_vars[group_id][otu_id][time_id].value);
      }
    }
  }

  var max_abund = d3.max(tmp);
  var scales = {"size": d3.scale.linear()
		.domain([0, max_abund])
		.range([.7, 13]),
	        "col": d3.scale.ordinal()
		.domain(Object.keys(abund_vars))
		.range(["#B1A1E6", "#F5916A"])};

  var links = d3.layout.cluster()
    .links(layout.nodes)
  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]})

  var link_selection = d3.select("#links")
      .selectAll(".tree_link")
      .data(links, link_id_fun);

  var all_node_pos = offset_nodes_abund(layout.nodes, abund_vars,
					scales.size);
  
  for (var j = 0; j < group_ids.length; j++) {
    for (var i = 0; i < layout.nodes.length; i++) {
      layout.nodes[i] = jQuery.extend(layout.nodes[i], all_node_pos[i][j]);
    }
    
    draw_nodes(d3.select("#nodes #group-" + j), layout.nodes,
	       abund_vars[group_ids[j]], group_ids[j], scales);
  }
}

function draw_nodes(el, nodes, abunds, group_id, scales) {
  var node_selection = el.selectAll(".tree_nodes")
      .data(nodes, function(d) { return group_id + "-" + d.name; });
  node_selection.exit().remove();
  node_selection.enter()
    .append("circle")
    .classed("tree_nodes", true)
    .attr({"cx": function(d) { return d.x; },
	   "cy": function(d) { return d.y; }})
    .style({"opacity": 0,
	    "r": function(d) { return scales.size(d3.mean(get_abunds(abunds, d.name)))},
	    "fill": function(d) { return scales.col(group_id)}});

  node_selection.transition()
    .duration(700)
    .attr({"cx": function(d) { return d.x; },
	   "cy": function(d) { return d.y; },
	   "r": function(d) { return scales.size(d3.mean(get_abunds(abunds, d.name)))}})
    .style({"opacity": 0.5,
	    "fill": function(d) { return scales.col(group_id)}});
}

function get_matches(names, search_str) {
  var matches = [];
  search_str = search_str.toLowerCase();
  var lower_names = names.map(function(d) { return d.toLowerCase(); });

  for (var i = 0; i < names.length; i++) {
    if (lower_names[i].search(search_str) != -1) {
      matches.push(names[i]);
    }
  }
  return matches;
}

function get_ancestor_matches(search_str) {
  if (search_str == "") return [];

  var nodes = d3.layout.cluster()
      .nodes(tree_var);
  var names = nodes.map(function(d) { return d.name; });
  var matches = get_matches(names, search_str);
  
  var ancestor_matches = [];
  for (var i = 0; i < matches.length; i++) {
    ancestor_matches = ancestor_matches.concat(
      get_ancestors(tree_var, matches[i], [])
    );
    ancestor_matches = _.uniq(ancestor_matches);
  }
  return ancestor_matches;
}
