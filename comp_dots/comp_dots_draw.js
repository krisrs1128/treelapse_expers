
var height = 300,
    width = 500
var node_size = [10, 50]
var tree_var = jQuery.extend(true, {}, tax_tree)

var svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height})
d3.select("svg")
  .append("rect")
  .attr({"width": width,
	 "height": height,
	 "fill": "#F5F5F5"})

var nodes = d3.layout.cluster()
    .nodes(tree_var);
var max_depth = d3.max(nodes.map(function(d) { return d.depth }));

var scales = {"x": d3.scale.linear()
	      .domain([0, 1])
	      .range([.1 * width, .9 * width]),
	      "y": d3.scale.linear()
	      .domain([0, 1 ])
	      .range([.1 * height, .9 * height]),
	      "depth": d3.scale.linear()
	      .domain([0, max_depth])
	      .range([.1 * height, .9 * height]),
	      "abund": d3.scale.linear()
	      .domain([0, 3])
	      .range([.7, 6]),
	      "fill": d3.scale.ordinal()
	      .domain([-1, 0, 1])
	      .range(["#4EBE98", "black", "#ED983F"])};

var links = d3.layout.tree()
    .links(nodes);

var abund_avg = average_over_time_multi(tax_abund);
var abund_diff = diff_counts(abund_avg);

var nodes_enter = d3.select("svg")
    .selectAll(".tree_node")
    .data(nodes).enter();

nodes_enter
  .append("circle")
  .attr({"cx": function(d) { return scales.x(d.x); },
	 "cy": function(d) { return scales.depth(d.depth); },
	 "r": function(d) {
	   var cur_diff = Math.abs(abund_diff[d.name])
	   return scales.abund(cur_diff);
	 }})
  .style({"fill": function(d) { return scales.fill(Math.sign(abund_diff[d.name])); }});

