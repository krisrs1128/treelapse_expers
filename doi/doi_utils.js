//////////////////////////////////////////////////////////////////////
// Functions to calculate degree-of-interest related quantities. We
// are following http://vis.stanford.edu/papers/doitrees-revisited
//////////////////////////////////////////////////////////////////////

/** Compute the DOI of a tree, given a specific single focus node
*
* Calculates the DOI according to
* http://vis.stanford.edu/papers/doitrees-revisited
*/
function set_doi(tree_var, focus_node_id, min_doi) {
  throw new Error("set_doi() is not yet implemented")
  var tree_var_internal = jQuery.extend({}, tree_var)
  set_tree_fisheye(tree_var_internal, 0, min_doi)
  return tree_var_internal;
}

/** Compute fisheye distribution over a tree
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
 * @return null, but modifies tree_var in place.
 * @example
 * test_doi = set_doi(tax_tree, "K:Bacteria", -10)
 */ 
function set_tree_fisheye(tree_var, doi, min_doi) {
  tree_var.doi = doi;
  if (tree_var.children == undefined || doi < min_doi) return;

  for (var i = 0; i < tree_var.children.length; i++) {
    set_tree_fisheye(tree_var.children[i], doi - 1);
  }
}


