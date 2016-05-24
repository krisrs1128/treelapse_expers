//////////////////////////////////////////////////////////////////////
// Functions to calculate degree-of-interest related quantities. We
// are following http://vis.stanford.edu/papers/doitrees-revisited
//////////////////////////////////////////////////////////////////////

var height = 300,
    width = 500
var node_size = [10, 50]
var min_doi = -3.5
var tree_var = jQuery.extend(true, {}, tax_tree);
var abund_var = tax_abund["19009"]

// just draw it for fun
var svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height})
d3.select("svg")
  .append("rect")
  .attr({"width": width,
	 "height": height,
	 "fill": "#F5F5F5"})

d3.select("svg")
  .append("g")
  .attr({"id": "links"});
d3.select("svg")
  .append("g")
  .attr({"id": "text"});
d3.select("svg")
  .append("g")
  .attr({"id": "nodes"});

var focus_node_id = "Bacteria";
var highlight_ids = [];
var display_dim = [width, height];

d3.select("#min_doi")
  .on("input", function() {
    min_doi = this.value
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
    }, 500);
  })
});
