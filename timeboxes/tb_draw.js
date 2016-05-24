
var abund_var = tax_abund["19009"];
var cur_lines = [];
var height = 300,
    width = 500

// just draw it for fun
var svg_elem = d3.select("body")
  .append("svg")
  .attr({"width": width,
	 "height": height})
d3.select("svg")
  .append("rect")
  .attr({"width": width,
	 "height": height,
	 "fill": "#F5F5F5"});

d3.select("svg")
  .append("g")
  .attr({"id": "all_ts"})

d3.select("svg")
  .append("g")
  .attr({"id": "all_brushes"});

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

var brush = d3.svg.brush()
    .x(scales.x)
    .y(scales.y)
    .on("brush", brush_fun);

d3.select("#all_brushes")
  .append("g")
  .classed("brush", true)
  .call(brush)
  .selectAll("rect")
  .style({"opacity": .1,
	  "fill": "#0A0A0A"});

function brush_fun() {
  var box_extent = brush.extent()
  box_extent = {"time_min": box_extent[0][0],
		"value_min": box_extent[0][1],
		"time_max": box_extent[1][0],
		"value_max": box_extent[1][1]};
  cur_lines = lines_in_box(abund_var, box_extent);
  tb_update();
}

tb_update();
