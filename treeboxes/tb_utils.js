function node_in_box(node, box_extent) {
  return (node.x >= box_extent.x_min) &&
    (node.x <= box_extent.x_max) &&
    (node.y >= box_extent.y_min) &&
    (node.y <= box_extent.y_max);
}

function nodes_in_box(nodes_data, box_extent) {
  var contained_ids = []
  for (var i = 0; i < nodes_data.length; i++) {
    if (node_in_box(nodes_data[i], box_extent)) {
      contained_ids.push(nodes_data[i].name);
    }
  }
  return contained_ids;
}
