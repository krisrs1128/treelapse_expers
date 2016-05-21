/**
* Functions to calculate degree-of-interest related quantities. We
* are following http://vis.stanford.edu/papers/doitrees-revisited
**/

/** 
 * Compute the DOI of a tree, given a specific single focus node
 *
 * Calculates the DOI according to
 * http://vis.stanford.edu/papers/doitrees-revisited
 * 
 * @param {Object} tree_var A tree structured object, of the kind created by d3's
 * tree and hierarchy functions.
 * @param {string} focus_node_id A string specifying the .name field in
 * the object that will be considered the "focus" node, around which to
 * set the doi distibution.
 * @param {float} min_doi The minimum doi at which point we stop traversing the
 * tree. This can save computation when navigating very large trees.
 * 
 * @return tree_var A copy of the input tree_var, but with the doi
 * distribution input as the .doi field in each node.
 *
 * @example 
 * // using tax_tree defined by src/processing/prepare_phylo.R
 * set_doi(tax_tree, "G:Ruminococcus", -2)
 **/
function set_doi(tree_var, focus_node_id, min_doi) {
  var desc_indic = contains_node(tree_var, focus_node_id);
  if (desc_indic) {
    tree_var.doi = 0;
    if (tree_var.children != null) {
      for (var i = 0; i < tree_var.children.length; i++) {
	tree_var.children[i] = set_doi(tree_var.children[i], focus_node_id, min_doi);
      }
    }
  } else {
    tree_var = set_tree_fisheye(tree_var, -1, min_doi);
  }
  return tree_var;
}

/** 
 * Check whether a tree contains a  node of a specified id
 * 
 * @param {Object} tree_var The tree sturctured variable that we will
 * containing objects whose .name attribute will be checked to contain
 * the id node_id.
 * @param {string} node_id The id to search the tree for.
 * @return {bool} true or false, depending on whether the node_id was
 * found in the tree.
 **/
function contains_node(tree_var, node_id) {
  if (tree_var.name == node_id) {
    return true;
  }

  if (tree_var.children == null) {
    return false;
  }

  var children_indic = []
  for (var i = 0; i < tree_var.children.length; i++) {
    var cur_indic = contains_node(tree_var.children[i], node_id);
    children_indic.push(cur_indic);
  }
  return children_indic.some(function(x) { return x; })
}

/** 
 * Compute fisheye distribution over a tree
 *
 * Assigns doi argument to current node, and doi - 1 to immediate
 * children, and doi - 2 to second order children, ..., until
 * it reaches min_doi
 *
 * @param {Object} tree_var A tree structured object, of the kind created by d3's
 * tree and hierarchy functions.
 * @param {float} doi The doi for the top node in the tree.
 * @param {float} min_doi The minimum doi at which point we stop traversing the
 * tree. This can save computation when navigating very large trees.
 * @return A copy of the tree, but with the fisheye distribution set
 * as the .doi field in each node.
 * @example
 * test_doi = set_doi(tax_tree, "K:Bacteria", -10)
 **/ 
function set_tree_fisheye(tree_var, doi, min_doi) {
  if (tree_var.doi == undefined) {
    tree_var.doi = doi;
  }

  if (tree_var.children != undefined && doi > min_doi) {
    for (var i = 0; i < tree_var.children.length; i++) {
      tree_var.children[i] = set_tree_fisheye(tree_var.children[i], doi - 1, min_doi);
    }
  }
  return tree_var;
}

/** 
 * Get nodes at a certain depth
 * 
 * @param {Array} x An array of objects with a .depth attribute
 * @param {int} i The depth to which to filter nodes.
 * @return An array of elements of x at a given depth.
 **/ 
function filter_depth(x, i) {
  return x.filter(function(d) { return d.depth == i; });
}

/** 
 * Define node segmentation given nodes and depths
 * 
 * Function that performs the node segmentation required for the
 * TreeBlock algorithm, using an array of nodes and their depths.
 * 
 * @param {array} nodes An array of nodes, assumed to contain a .depth
 * field. 
 * @param {array} depths An array of integers, giving the depths of
 * the specified nodes.
 * @return {array} nodes The original array, but with a .segment
 * attribute added to each node.
 **/ 
function set_node_segments(nodes, depths) {
  // set 0 for root [any nodes at deoth 0]
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].depth == 0) {
      nodes[i].segment = 0;
    }
  }

  // intentionally skip root, and iterate over depths
  for (var i = 1; i <= d3.max(depths); i++) {
    var parents = filter_depth(nodes, i - 1).map(function(d) { return d.name; });
    var children = filter_depth(nodes, i);
    
    // iterate over nodes at this depth
    for (var j = 0; j < children.length; j++) {
      var cur_ix = nodes.map(function(d) { return d.name})
	  .indexOf(children[j].name);
      nodes[cur_ix].segment = parents.indexOf(children[j].parent.name);
    }
  }
  return nodes;
}

/** 
 * Define a tree segmentation
 * 
 * This enumerate blocks [0, 1, ..., n_depth_d] at each depth level,
 * which are used in the TreeBlock algorithm in the DOI paper. At any
 * fixed depth, nodes are assigned to the same block if they have
 * the same parent. 
 * 
 * This implementation uses a scoping trick. It relies on the fact
 * that modifying the nodes variable [associated with a
 * d3.layout.tree() modifies the tree from which it was created.
 * 
 * @param {Object} tree_var A tree structured object, of the kind created by d3's
 * tree and hierarchy functions. This is the object that will be
 * segmented.
 * @return {Object} tree_var The original tree_var object, but with
 * with a new .segment attribute within each subject, giving the
 * segment needed by the TreeBlock algorithm.
 * @reference http://vis.stanford.edu/papers/doitrees-revisited
 **/ 
function segment_tree(tree_var) {
  var tree_layout = d3.layout.cluster();
  var nodes = tree_layout.nodes(tree_var);
  depths = nodes.map(function(d) { return d.depth });
  nodes = set_node_segments(nodes, depths);
  return tree_var;
}

function get_layout_size(nodes) {
  var nodes_pos = {"x": nodes.map(function(d) { return d.x }),
		   "y": nodes.map(function(d) { return d.y })}
  return [d3.max(nodes_pos.x) - d3.min(nodes_pos.x),
	  d3.max(nodes_pos.y) - d3.min(nodes_pos.y)];
}

// filter away nodes that don't have a doi assigned to them
function filter_doi(tree_var) {
  if (Object.keys(tree_var).indexOf("children") != -1) {
    for (var i = 0; i < tree_var.children.length; i++) {
      if (Object.keys(tree_var.children[i]).indexOf("doi") != -1) {
	tree_var.children[i] = filter_doi(tree_var.children[i]);
      }
    }
  }
  return tree_var;
}

// filter away nodes in a certain block / in a certain segment
function filter_block(tree_var, depth, segment) {
  if (tree_var.depth == depth && tree_var.segment == segment) {
    return;
  }

  if (Object.keys(tree_var).indexOf("children") != -1) {
    var filtered_children = []
    for (var i = 0; i < tree_var.children.length; i++) {
      var filtered = filter_block(tree_var.children[i], depth, segment);
      if (typeof filtered != "undefined") {
	filtered_children.push(filtered);
      }
    }
    tree_var.children = filtered_children;
  }
  return tree_var;
}

function tree_block(tree_var, focus_node_id, min_doi = -10,
		    display_dim = [500, 500],
		    node_size = [4, 10]) {
  tree_var = set_doi(tree_var, focus_node_id, min_doi);
  tree_var = filter_doi(tree_var);
  tree_var = segment_tree(tree_var);

  var tree_layout = d3.layout.cluster();
  var nodes = tree_layout.nodeSize(node_size)
      .nodes(tree_var);
  var cur_size = get_layout_size(nodes);
  if (cur_size[0] > display_dim[0]) {
    tree_var = trim_width(tree_var, display_dim, node_size);
  }
  if (cur_size[1] > display_dim[1]) {
    tree_var = trim_height(tree_var, display_dim, node_size);
  }
  
  var tree_layout = d3.layout.cluster();
  var nodes = tree_layout.nodeSize(node_size)
      .nodes(tree_var);
  return {"tree_var": tree_var, "nodes": nodes}
}

function trim_height(tree_var) {
  return tree_var;
}

function get_block_dois(tree_var) {
  var nodes = d3.layout.tree()
      .nodes(tree_var);

  var block_dois = {};
  for (var i = 0; i < nodes.length; i++) {
    cur_depth = nodes[i].depth
    cur_segment = nodes[i].segment

    if(Object.keys(block_dois).indexOf("" + cur_depth) == -1) {
      block_dois[cur_depth] = {}
    }

    if (Object.keys(block_dois[cur_depth]).indexOf("" + cur_segment) == -1) {
      block_dois[cur_depth][cur_segment] = [nodes[i].doi];
    } else {
      block_dois[cur_depth][cur_segment].push(nodes[i].doi);
    }
  }

  return block_dois;
}

function average_block_dois(tree_var) {
  var block_dois = get_block_dois(tree_var);
  var depths = Object.keys(block_dois).map(parseFloat);

  var averages_values = [];
  var averages_segments = [];
  var averages_depths = [];
  for (var i = 0; i <= d3.max(depths); i++) {
    var segments = Object.keys(block_dois[i]).map(parseFloat);
    for (var j = 0; j <= d3.max(segments); j++) {
      averages_depths.push(i)
      averages_segments.push(j)
      averages_values.push(d3.mean(block_dois[i][j]));
    }
  }
  return {"depths": averages_depths,
	  "segments": averages_segments,
	  "values": averages_values};
}

function trim_width(tree_var, max_width, node_size) {
  var average_dois = average_block_dois(tree_var);
  var sorted_dois = average_dois.values
      .concat()
      .sort(function(a, b) {
	return a - b;
      })
  sorted_dois = _.uniq(sorted_dois);
  
  for (var i = 0; i < sorted_dois.length; i++) {

    var nodes = d3.layout.cluster()
	.nodeSize(node_size)
	.nodes(tree_var);
    console.log(nodes);
    cur_size = get_layout_size(nodes);
    if (cur_size[0] < max_width) break;

    for (var j = 0; j < average_dois.values.length; j++) {
      if (average_dois.values[j] == sorted_dois[i]) {
	tree_var = filter_block(tree_var, average_dois.depths[j], average_dois.segments[j]);
      }
    }

  }
  return tree_var;
}
