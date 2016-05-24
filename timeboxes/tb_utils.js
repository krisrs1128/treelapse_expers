function point_in_box(point, box_extent) {
  return (point.time >= box_extent.time_min) &&
    (point.time <= box_extent.time_max) &&
    (point.value >= box_extent.value_min) &&
    (point.value <= box_extent.value_max);
}

function line_in_box(line_data, box_extent) {
  for (var i = 0; i < line_data.length; i++) {
    var cur_check = point_in_box(line_data[i], box_extent);
    if (cur_check) {
      return true;
    }
  }
  return false;
}

function lines_in_box(lines_data, box_extent) {
  var contained_ids = []
  for (var line_id in lines_data) {
    if (line_in_box(lines_data[line_id], box_extent)) {
      contained_ids.push(line_id);
    }
  }
  return contained_ids;
}
