# @title Recursively calculate the counts within each sample type for each
#     internal node in a tree
# @param phy_tree A phylo describing the relationships between nodes. The tip labels
#     must correspond to the OTU column in otus.
# @param otus An vector specifying the counts of each OTU
#     in each sample. The column names must be sample names, and there must
#     be a column OTU giving the OTU or internal node label for that row.
# @param aggr_var How should we aggregate counts? A vector mapping sample
#     names (vector names) in the otus to groups (vector values), so
#     we can sum counts over those groups
#
# @return tree_counts A data frame whose rows are either internal nodes or tips,
#     column names are groups defined in aggr_var, and ij^th element is the
#     number of OTUs descending from the i^th node within group j in aggr_var.
tree_counts <- function(phy, counts) {

  # Convert counts to data.table and extract edgelist for tree
  names_map <- c(phy$tip.label, phy$node.label)
  phy_edgelist <- data.table::data.table(names_map[phy$edge[, 1]], names_map[phy$edge[, 2]])
  data.table::setnames(phy_edgelist, c("parent", "child"))

  result <- data.table(label = names_map, count = counts[names_map])

  internal_nodes <- result[is.na(result$count), "label", with = F] %>%
    unlist()

  for (i in seq_along(internal_nodes)) {
    node_names <- c(phy$tip.label, phy$node.label)
    cur_ix  <- which(internal_nodes[i] == node_names)
    desc_ix <- phangorn::Descendants(phy, cur_ix, type = "tips")[[1]]
    descendants <- node_names[desc_ix]
    result[result$label == internal_nodes[i], "count"] <- sum(counts[descendants])
  }
  result
}

# @title Generate a nested list representing the phylo structure
# @description This representation is easily converted to the json required by
# d3 by using toJSON in the jsonlite package.
tree_json <- function(el, cur_node) {
  cur_ix <- which(el$parent == cur_node)
  children <- el[cur_ix, "child"]

  if (length(children) == 0) {
    res <- list("name" = cur_node)
  } else {
    sublist <- list()
    for (i in seq_along(children)) {
      sublist[[i]] <- tree_json(el, children[i])
      sublist[[i]]$length <- el[cur_ix[i], "length"]
      sublist[[i]]$depth <- el[cur_ix[i], "depth"]
    }
    res <- list("name" = cur_node,
                "children" = sublist)
  }
  res
}
