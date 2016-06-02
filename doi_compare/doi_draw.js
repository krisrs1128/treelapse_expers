//////////////////////////////////////////////////////////////////////
// Functions to calculate degree-of-interest related quantities. We
// are following http://vis.stanford.edu/papers/doitrees-revisited
//////////////////////////////////////////////////////////////////////

var height = 300,
    width = 1000;
var node_size = [$("#node_x").attr("value"), $("#node_y").attr("value")];
var min_doi = $("#min_doi").attr("value");
var min_avg_abund = $("#min_avg_abund").attr("value");
var tree_var = jQuery.extend(true, {}, cst_tax_tree);
var abund_vars = cst_tax_abund

// just draw it for fun
var svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height})
d3.select("svg")
  .append("rect")
  .attr({"width": width,
	 "height": height,
	 "fill": "#F7F7F7"})

d3.select("svg")
  .selectAll("g")
  .data(["highlight-links", "links", "nodes", "text"]).enter()
  .append("g")
  .attr({"id": function(d) { return d; }});

for (var i = 0; i < Object.keys(abund_vars).length; i++) {
  d3.select("#nodes")
    .append("g")
    .attr({"id": "group-" + i})
  d3.select("#links")
    .append("g")
    .attr({"id": "group-" + i})
}

var focus_node_id = "Bacteria";
var highlight_ids = [];
var display_dim = [width, height];

d3.select("#min_doi")
  .on("input", function() {
    min_doi = this.value;
    doi_update();
  });

d3.select("#min_avg_abund")
  .on("input", function() {
    min_avg_abund = this.value;
    doi_update();
  });

d3.select("#node_x")
  .on("input", function() {
    node_size[0] = this.value
    doi_update();
  });

d3.select("#node_y")
  .on("input", function() {
    node_size[1] = this.value
    doi_update();
  });

doi_update();

$(document).ready(function() {
  var timeoutID = null;
  $('#search_box').keyup(function() {
    clearTimeout(timeoutID);
    var $target = $(this);
    timeoutID = setTimeout(function() {
      highlight_ids = get_ancestor_matches($target.val());
      tree_var = jQuery.extend(true, {}, tax_tree);
      doi_update();
    }, 10);
  })
});
