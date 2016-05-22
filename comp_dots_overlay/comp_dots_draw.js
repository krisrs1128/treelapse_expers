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

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]})
var nodes = d3.layout.cluster()
    .nodes(tree_var);
var max_depth = d3.max(nodes.map(function(d) { return d.depth }));

var abund_avg = average_over_time_multi(tax_abund);
var sample_ids = Object.keys(abund_avg);

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
	      .range([.7, 4]),
	      "fill": d3.scale.ordinal()
	      .domain(sample_ids)
	      .range(["#4EBE98", "#FA8F56"])};

var links = d3.layout.tree()
    .links(nodes);

var node_selection = d3.select("svg")
    .selectAll(".tree_node")
    .data(nodes)

var link_selection = d3.select("svg")
    .selectAll(".tree_link")
    .data(links, function(d) {
      return d.source.name + "-" + d.target.name
    })

for (var i = 0; i < sample_ids.length; i++) {
  link_selection.enter()
    .append("path", "g")
    .classed("tree_link", true)
    .attr({"d": function(d) {
      var source = {"x": scales.x(d.source.x),
		    "y": scales.depth(d.source.depth)};
      var target = {"x": scales.x(d.target.x),
		    "y": scales.depth(d.target.depth)};
      return diagonal({"source": source, "target": target});
    }})
    .style({"stroke": function(d) {
      if (abund_avg[sample_ids[i]][d.target.name] == 0) {
	return "black";
      } else {
	return scales.fill(sample_ids[i])
      }},
	    "stroke-width": function(d) {
	      var cur_abund = abund_avg[sample_ids[i]][d.target.name];
	      if (cur_abund == 0) {
		return .5
	      } else {
		return scales.abund(cur_abund);
	      }
	    },
	    "opacity": .6});
}

for (var i = 0; i < sample_ids.length; i++) {
  node_selection.enter()
    .append("circle")
    .classed("tree_node", true)
    .attr({"cx": function(d) { return scales.x(d.x); },
	   "cy": function(d) { return scales.depth(d.depth); },
	   "r": function(d) {
	     var cur_abund = abund_avg[sample_ids[i]][d.name];
	     if (cur_abund == 0) {
	       return .5
	     } else {
	       return scales.abund(cur_abund);
	     }
	   }})
    .style({"fill": function(d) {
      if (abund_avg[sample_ids[i]][d.name] == 0) {
	return "black";
      } else {
	return scales.fill(sample_ids[i])
      }},
	    "opacity": .6});

}
