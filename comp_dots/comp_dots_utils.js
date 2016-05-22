
function average_over_time(abund) {
  result = {};
  var otu_ids = Object.keys(abund)
  for (var j = 0; j < otu_ids.length; j++) {
    var cur_abunds = abund[otu_ids[j]]
    cur_abunds = cur_abunds.map(function(d) { return d.value; });
    result[otu_ids[j]] = d3.mean(cur_abunds);
  }
  return result;
}

function average_over_time_multi(abund) {
  var sample_ids = Object.keys(abund);
  var result = {};
  for (var i = 0; i < sample_ids.length; i++) {
    result[sample_ids[i]] = average_over_time(abund[sample_ids[i]]);
  }
  return result;
}


function diff_counts(counts) {
  var sample_ids = Object.keys(counts);
  var otu_ids = Object.keys(counts[sample_ids[0]]);
  var diffs = {}
  for (var i = 0; i < otu_ids.length; i++) {
    diffs[otu_ids[i]] = counts[sample_ids[0]][otu_ids[i]] -
      counts[sample_ids[1]][otu_ids[i]]
  }
  return diffs;
}
