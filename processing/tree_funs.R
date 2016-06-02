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
# library("phyloseq")
# data(GlobalPatterns)
# GP <- subset_taxa(GlobalPatterns, Phylum=="Chlamydiae")
# el <- phy_tree(GP)$edge
# mapping <- c(phy_tree(GP)$tip.label, phy_tree(GP)$node.label)
# mapping <- setNames(mapping, seq_along(mapping))
# counts <- otu_table(GP)@.Data[, 1]
# tree_counts(el, mapping, counts)
tree_counts <- function(el, mapping, counts) {
  result <- data.table(label = mapping, count = counts[mapping])
  internal_nodes <- result[is.na(result$count), "label", with = F] %>%
    unlist()

  for (i in seq_along(internal_nodes)) {
    cur_ix  <- which(internal_nodes[i] == mapping)
    cur_tips <- tip_descendants(el, cur_ix)
    result[result$label == internal_nodes[i], "count"] <- sum(counts[mapping[cur_tips]])
  }
  result
}

# @title Get all the descendants that are tips
# @examples
# library("phyloseq")
# data(GlobalPatterns)
# GP <- subset_taxa(GlobalPatterns, Phylum=="Chlamydiae")
# el <- phy_tree(GP)$edge
# tip_descendants(el, 34)
tip_descendants <- function(el, cur_ix) {
  library("igraph")
  G <- graph.edgelist(el)
  tips <- setdiff(el[, 2], el[, 1])
  descendants <- neighborhood(G, order = max(el), nodes = cur_ix,
                              mode = "out")[[1]]
  tips[tips %in% descendants] 
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

# @title Convert a Taxonomic Table into an edgelist
# @description This is a helper that lets us convert a taxonomic table
# (strains on rows and taxonomic ranks on columns).
# @importFrom magrittr %>%
# @examples
# library("phyloseq")
# data(GlobalPatterns)
# taxa <- tax_table(GlobalPatterns)@.Data
# gp_tax <- tree_from_taxa(taxa)
tree_from_taxa <- function(taxa) {
  taxa <- unique(taxa)
  mapping <- taxa %>%
    as.character() %>%
    unique()
  inv_mapping <- setNames(mapping, seq_along(mapping))
  mapping <- setNames(seq_along(mapping), mapping)

  el <- vector(length = nrow(taxa) * (ncol(taxa) - 1),
               mode = "list")
  k <- 1
  for (i in seq_len(nrow(taxa))) {
    for (j in seq_len(ncol(taxa) - 1)) {
      if (is.na(taxa[i, j])) break
      el[[k]] <- c(mapping[taxa[i, j]], mapping[taxa[i, j + 1]])
      k <- k + 1
    }
  }

  el <- do.call(rbind, el) %>%
    na.omit() %>%
    unique()
  el <- data.frame(el[order(el[, 1]), ])
  colnames(el) <- c("parent", "child")
  list(el = el, mapping = mapping, inv_mapping = inv_mapping)
}

# @title Apply the tree_counts() function across unique time / person
# combinations
#
# @description This is just a wrapper for tree_counts, that applies it
# across subjects and times.
# See processing/prepare_phylo.R for an example application.
tree_counts_multi <- function(el, mapping, counts, sample_info) {
  unique_subjects <- unique(sample_info$subject) %>%
    as.character()
  counts_list <- list()
  
  for (i in seq_along(unique_subjects)) {
    sample_info$subject <- as.character(sample_info$subject)
    unique_dates <- sample_info[sample_info$subject == unique_subjects[i], "rel_day"] %>%
      unlist() %>%
      unique() %>%
      sort()

    counts_list[[unique_subjects[i]]] <- matrix(0, nrow = length(mapping),
                                                ncol = length(unique_dates),
                                                dimnames = list(mapping, unique_dates))

    cat(sprintf("Processing subject %s\n", unique_subjects[i]))
    for (j in seq_along(unique_dates)) {
      cur_ix <- which(sample_info$subject %in% unique_subjects[i] &
                        sample_info$rel_day %in% unique_dates[j])
      cur_counts <- tree_counts(el, mapping, unlist(colSums(counts[cur_ix, , drop = F])))
      cur_counts <- setNames(cur_counts$count, cur_counts$label)

      reorder_ix <- match(rownames(counts_list[[i]]), names(cur_counts))
      counts_list[[i]][, j] <- log(1 + cur_counts[reorder_ix]) %>%
        round(digits = 2)
    }
  }

  counts_list <- counts_list %>%
    unfold_counts_list()
  names(counts_list) <- unique_subjects
  counts_list
}

# @title Utility used to unwrap the matrix in tree_counts_multi() into a list
#
# @description This is similar to alply, but I couldn't get that to
# quite work.
unfold_counts_list <- function(counts_list) {
  counts_list %>%
    lapply(function(z) {
      result <- list()
      for (i in seq_len(nrow(z))) {
        result[[i]] <- data.frame(time = colnames(z), value = z[i, ])
        rownames(result[[i]]) <- NULL
      }
      names(result) <- rownames(z)
      result
    })
}
