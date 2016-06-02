
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
		.range([1.1, 15]),
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

  var otu_ids = Object.keys(all_node_pos);
  for (var j = 0; j < group_ids.length; j++) {
    for (var i = 0; i < links.length; i++) {
      var source_pos = all_node_pos[links[i].source.name][group_ids[j]]
      var target_pos = all_node_pos[links[i].target.name][group_ids[j]];

      links[i].source = jQuery.extend(links[i].source, source_pos);
      links[i].target = jQuery.extend(links[i].target, target_pos);
    }
    draw_links(d3.select("#links #group-" + j), links,
	       abund_vars[group_ids[j]], group_ids[j], scales);
  }
  draw_text(d3.select("#text"), links, abund_vars[group_ids[1]], scales);
}

function draw_links(el, links, abunds, group_id, scales) {
  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]})

  var links_selection = el.selectAll(".tree_link")
      .data(links, function(d) {
	return group_id + "-" + d.source.name + d.target.name;
      });
  links_selection.exit().remove();
  links_selection.enter()
    .append("path", "g")
    .classed("tree_link", true)
    .style({
      "opacity": 0,
      "stroke": function(d) {
	var cur_abunds = get_abunds(abunds, d.target.name)
	if (d3.mean(cur_abunds) == 0) {
	  return "black";
	}
	return scales.col(group_id)
      },
      "stroke-width": function(d) {
	var cur_abunds = get_abunds(abunds, d.target.name)
	return scales.size(d3.mean(cur_abunds));
      }
    })
    .on("click",
	function(d) {
	  focus_node_id = d.target.name;
	  doi_update();
	});

  links_selection.transition()
    .duration(1000)
    .attr({"d": function(d) {
      var source = {"x": d.source.x, "y": d.source.y}
      var target = {"x": d.target.x, "y": d.target.y}
      return diagonal({"source": source, "target": target})
    }})
    .style({
      "opacity": .8,
      "stroke-width": function(d) {
	var cur_abunds = get_abunds(abunds, d.target.name)
	return scales.size(d3.mean(cur_abunds));
      }});
}

function draw_text(el, links, abunds, scales) {
  var text_selection = el.selectAll(".tree_text")
      .data(links.filter(function(d) { return d.source.doi >= -1}),
	    function(d) { return d.source.name });

  text_selection.exit().remove();

  text_selection.enter()
    .append("text")
    .classed("tree_text", true)
    .style({"opacity": 0});

  text_selection
    .transition()
    .duration(1000)
    .text(function(d) { return d.source.name })
    .attr({
      "x": function(d) {
	var cur_abunds = get_abunds(abunds, d.source.name);
	var r = scales.size(d3.mean(cur_abunds));
	return d.source.x + 1.4 * Math.sqrt(r);
      },
      "y": function(d) {
	var cur_abunds = get_abunds(abunds, d.source.name);
	var r = scales.size(d3.mean(cur_abunds));
	return d.source.y - Math.sqrt(r);
      },
      "font-size": function(d) {
	if(d.source.doi == 0) {
	  return 12
	} else {
	  return 7
	}}})
    .style({
      "opacity":  function(d) {
	if(d.source.doi == 0) {
	  return 1
	} else {
	  return .6
	}}});
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
