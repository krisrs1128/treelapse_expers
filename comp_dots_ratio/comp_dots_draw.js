
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
	      .domain([0,1 ])
	      .range([.1 * height, .9 * height]),
	      "depth": d3.scale.linear()
	      .domain([0, max_depth])
	      .range([.1 * height, .9 * height]),
	      "abund": d3.scale.linear()
	      .domain([1, 270])
	      .range([.8, 6]),
	      "fill": d3.scale.ordinal()
	      .domain([true, false])
	      .range(["#ED983F", "#4EBE98"])};

var links = d3.layout.tree()
    .links(nodes);

var abund_avg = average_over_time_multi(tax_abund);
var abund_ratio = ratio_counts(abund_avg);
var keys = Object.keys(abund_avg);

d3.select("svg")
  .selectAll(".tree_node")
  .data(nodes).enter()
  .append("circle")
  .attr({"cx": function(d) { return scales.x(d.x); },
	 "cy": function(d) { return scales.depth(d.depth); },
	 "fill": function(d) {
	   var x = abund_avg[keys[0]][d.name]
	   var y = abund_avg[keys[1]][d.name]
	   if (x == y) {
	     return "black"
	   } else {
	     return scales.fill(x > y);
	   }},
	 "r": function(d) {
	   return scales.abund(abund_ratio[d.name]);
	 }})
