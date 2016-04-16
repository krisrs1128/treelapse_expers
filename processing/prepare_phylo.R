#! /usr/bin/env Rscript

# File description -------------------------------------------------------------

# Setup packages ---------------------------------------------------------------
# List of packages for session
.packages = c("data.table",
              "plyr",
              "phangorn",
              "jsonlite",
              "phyloseq",
              "dplyr")

# Install CRAN packages (if not already installed)
.inst <- .packages %in% installed.packages()
if(any(!.inst)) {
  install.packages(.packages[!.inst], repos='http://cran.rstudio.com/')
}

# Load packages into session 
lapply(.packages, require, character.only=TRUE)
cat("\014")  # Clear console

# General setup ----------------------------------------------------------------
rm(list=ls()) # Delete all existing variables
graphics.off() # Close all open plots

# Code Block -------------------------------------------------------------------

## ---- funs ----
source(file.path("processing", "tree_funs.R"))

tree_counts_wrapper <- function(variable, value) {
  counts <- setNames(value, variable)
  data.frame(tree_counts(phy_tree(PS), counts))
}

## ---- get-data ----
pregnancy_path <- "http://statweb.stanford.edu/~susan/papers/Pregnancy/PregnancyClosed15.Rdata"
tmp <- tempfile()
download.file(pregnancy_path, tmp)
load(tmp)

PS <- PS %>% subset_taxa(Genus == "Ruminococcus")

## --- sample data ----
Z <- sample_data(PS)[, c("DateColl", "SubjectID")] %>%
  data.frame(check.names = F)
Z <- Z[Z$SubjectID %in% c("10043", "10040", "10032"), ]

Z$DateColl <- strptime(Z$DateColl, "%m/%d/%y %H:%M")
Z$DateColl <- paste(month(Z$DateColl), year(Z$DateColl), sep = "-")
Z$DateColl <- as.factor(Z$DateColl)
X <- otu_table(PS) %>%
  data.frame(check.names = F)
X <- X[rownames(X) %in% rownames(Z), ]

# get counts at different levels in the tree associated with the first sample
Z$SubjectID <- droplevels(Z$SubjectID)
Z$DateColl <- droplevels(Z$DateColl)

phy_tree(PS)$node.label <- seq_along(phy_tree(PS)$node.label)
phy_names <- c(phy_tree(PS)$node.label, phy_tree(PS)$tip.label)

unique_dates <- unique(Z$DateColl)
unique_subjects <- unique(Z$SubjectID)
abund <- replicate(length(unique_dates),
                   matrix(0, nrow = length(phy_names),
                          ncol = length(unique_subjects),
                          dimnames = list(phy_names, unique_subjects)),
                   simplify = FALSE)
    
for (i in seq_along(unique_dates)) {
  cat(sprintf("Processing time %s\n", unique_dates[i]))
  for(j in seq_along(unique_subjects)) {
    cur_subject_ix <- which(Z$SubjectID %in% unique_subjects[j] &
                              Z$DateColl %in% unique_dates[i])
    cur_X <- colSums(X[cur_subject_ix, ])
    counts <- tree_counts(phy_tree(PS), unlist(cur_X))
    counts <- setNames(counts$count, counts$label)
    abund[[i]][ , j] <- counts[match(rownames(abund[[i]]), names(counts))]
  }
}

names(abund) <- unique_dates
abund <- lapply(abund, function(x) {
  as.list(data.frame(t(x)))
})

sprintf("var abund = %s", toJSON(abund)) %>%
  cat(file = file.path("data", "abund.js"))

# create a json object representing edges
phy_names <- c(phy_tree(PS)$tip.label, phy_tree(PS)$node.label)
el <- data.frame(phy_tree(PS)[["edge"]], phy_tree(PS)[["edge.length"]])
el[, 1] <- phy_names[el[, 1]]
el[, 2] <- phy_names[el[, 2]]
colnames(el) <- c("parent", "child", "length")
res <- tree_json(el, "0.930.581")
sprintf("var tree = %s", toJSON(res, auto_unbox = T)) %>%
  cat(file = file.path("data", "tree.js"))

# Tidy things up ---------------------------------------------------------------
cat("\014")  # Clear console

# Scratchpad -------------------------------------------------------------------

