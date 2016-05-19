//////////////////////////////////////////////////////////////////////
// Functions to calculate degree-of-interest related quantities. We
// are following http://vis.stanford.edu/papers/doitrees-revisited
//////////////////////////////////////////////////////////////////////

/** Compute the DOI of a tree, given a specific single focus node
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
*/
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
 */
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

//set_tree_fisheye(tree_var_internal, 0, min_doi);

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
 * @return A copy of the tree, but with the fisheye distribution set
 * as the .doi field in each node.
 * @example
 * test_doi = set_doi(tax_tree, "K:Bacteria", -10)
 */ 
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
