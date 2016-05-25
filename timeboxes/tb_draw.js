
var abund_var = tax_abund["19009"];
var cur_lines = [];
var height = 300,
    width = 500
var brush_ix = 0;

// just draw it for fun
var svg_elem = d3.select("body")
    .append("svg")
    .attr({"width": width,
	   "height": height});
d3.select("svg")
  .append("rect")
  .attr({"width": width,
	 "height": height,
	 "fill": "#FAFAFA"});

d3.select("svg")
  .append("g")
  .attr({"id": "all_ts"})

d3.select("svg")
  .append("g")
  .attr({"id": "all_brushes"})

var abund_array = [];
var time_array = [];
for (var otu_id in abund_var) {
  for (var time_id in abund_var[otu_id]) {
    var cur_elem = abund_var[otu_id][time_id]
    abund_array.push(cur_elem.value);
    time_array.push(cur_elem.time);
  }
}

abund_array = _.uniq(abund_array)
  .map(parseFloat);
time_array = _.uniq(time_array)
  .map(parseFloat);

var scales = {"x": d3.scale.linear()
	      .domain(d3.extent(time_array))
	      .range([10, width - 10]),
	      "y": d3.scale.linear()
	      .domain(d3.extent(abund_array))
	      .range([height - 15, 30])};

var all_brushes = [];
var brush_nums = [];
function get_nums(d) {
  return parseFloat(d.match(/\d+/)[0])
}

function new_brush() {
  var cur_brush = d3.svg.brush()
      .x(scales.x)
      .y(scales.y)
      .on("brush", brush_fun);

  var cur_id = d3.max(brush_nums) + 1;
  if (isNaN(cur_id)) cur_id = 0;
  all_brushes.push({"id": "brush-" + cur_id, "brush": cur_brush});
  brush_nums = all_brushes.map(function(d) { return get_nums(d.id) });

  brush_ix = all_brushes.length - 1;
  focus_brush(brush_nums[brush_ix]);
  update();
}

function remove_brush() {
  new_all_brushes = all_brushes.splice();
  for (var i = 0; i < all_brushes.length; i++) {
    if (all_brushes[i].id != "brush-" + brush_nums[brush_ix]) {
      console.log(all_brushes[i].id)
      new_all_brushes.push(all_brushes[i]);
    }
  }
  all_brushes = new_all_brushes;
  brush_nums = all_brushes.map(function(d) { return get_nums(d.id) });
  console.log(all_brushes);
  brush_ix = (brush_ix + 1) % all_brushes.length
  focus_brush(brush_nums[brush_ix]);
  update();
  brush_fun();
}

function update() {
  var brush_selection = d3.select("#all_brushes")
      .selectAll(".brush")
      .data(all_brushes, function(d) { return d.id; })

  brush_selection.enter()
    .append("g")
    .classed("brush", true)
    .attr("id", function(d, i) { return "brush-" + i; })
    .each(function(d) {
      d3.select(this).call(d.brush);
    });

  brush_selection.exit().remove();

  brush_selection
    .transition()
    .selectAll("rect.extent")
    .style({
      "fill": "#583045",
      "opacity": function(d, i){
	if (d.id == "brush-" + brush_nums[brush_ix]) {
	  return .4;
	} else {
	  return .2;
	}
      }});
}
  
function brush_fun() {
  if (all_brushes.length > 0) {
    cur_lines = Object.keys(abund_var);
    for (var i = 0; i < all_brushes.length; i++) {
      var box_extent = all_brushes[i].brush.extent()
      box_extent = {"time_min": box_extent[0][0],
		    "value_min": box_extent[0][1],
		    "time_max": box_extent[1][0],
		    "value_max": box_extent[1][1]};
      cur_lines = _.intersection(cur_lines, 
				 lines_in_box(abund_var,
					      box_extent)
				);
    }
  } else {
    cur_lines = []
  }
  console.log(cur_lines);
  tb_update();
}

function focus_brush(brush_ix) {
  d3.selectAll(".brush")
    .style({"pointer-events": function(d) {
      if (d.id == "brush-" + brush_ix) {
	return "all";
      } else {
	return "none";
      }
    }})
}

function change_focus() {
  brush_ix = (brush_ix + 1) % all_brushes.length;
  focus_brush(brush_nums[brush_ix]);
  update();
}

$(document).keypress(function(event){
  change_focus();
})
tb_update();
update();
