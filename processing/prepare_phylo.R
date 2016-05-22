#! /usr/bin/env Rscript

# File description -------------------------------------------------------------

# Setup packages ---------------------------------------------------------------
# List of packages for session
.packages  <-  c("data.table",
                 "plyr",
                 "igraph",
                 "jsonlite",
                 "phyloseq",
                 "picante",
                 "dplyr")

# Install CRAN packages (if not already installed)
.inst <- .packages %in% installed.packages()
if(any(!.inst)) {
  install.packages(.packages[!.inst], repos = "http://cran.rstudio.com/")
}

# Load packages into session 
sapply(.packages, require, character.only=TRUE)
cat("\014")  # Clear console

# General setup ----------------------------------------------------------------
rm(list=ls()) # Delete all existing variables
graphics.off() # Close all open plots

# Code Block -------------------------------------------------------------------

## ---- funs ----
source(file.path("processing", "tree_funs.R"))

## ---- get-data ----
pregnancy_path <- "http://statweb.stanford.edu/~susan/papers/Pregnancy/PregnancyClosed15.Rdata"
tmp <- tempfile()
download.file(pregnancy_path, tmp)
load(tmp)

## ---- k-over-a-filter ----
PS <- PS %>%
  subset_samples(SubjectID %in% c("19009", "19010")) %>%
  filter_taxa(function(x) sum(x > 1) > 0.1 * length(x), TRUE)


## --- sample data ----
sample_info <- sample_data(PS)
names(sample_info@.Data) <- colnames(sample_info)
sample_info$sample_id <- rownames(sample_info)

sample_info$date_tmp <- strptime(sample_info$DateColl, "%m/%d/%y %H:%M") %>%
  as.numeric()
sample_info <- sample_info %>%
  data.frame() %>%
  arrange(SubjectID, date_tmp) %>%
  group_by(SubjectID) %>%
  mutate(order = 1:n())

sample_info <- sample_info %>%
  select(sample_id, DateColl, SubjectID)
colnames(sample_info) <- c("sample_id", "date", "subject")

sample_info$date <- strptime(sample_info$date, "%m/%d/%y %H:%M")
sample_info$date <- paste(month(sample_info$date), mday(sample_info$date), year(sample_info$date), sep = "-")
sample_info$date <- as.factor(sample_info$date)
sample_info$subject <- droplevels(sample_info$subject)
sample_info$date <- droplevels(sample_info$date)

## ---- otu-counts ----
counts <- otu_table(PS) %>%
  data.frame(check.names = F)
counts <- counts[rownames(counts) %in% sample_info$sample_id, ]

## ---- phy-tree-abundances ----
el <- phy_tree(PS)$edge
phy_mapping <- c(phy_tree(PS)$tip.label, seq_along(phy_tree(PS)$node.label))
phy_mapping <- setNames(phy_mapping, seq_along(phy_mapping))
phy_abund <- tree_counts_multi(el, phy_mapping, counts, sample_info)

sprintf("var phy_abund = %s", toJSON(phy_abund, auto_unbox = T)) %>%
  cat(file = file.path("data", "phy_abund.js"))

## ---- taxonomy-tree ----
tax <- tax_table(PS)@.Data
for (j in seq_len(ncol(tax))) {
  prefix <- substr(colnames(tax)[j], 1, 1)
  tax[, j] <- paste0(prefix, ":", tax[, j])
}
tax <- cbind(tax, OTU = rownames(tax))
tax_tree <- tree_from_taxa(tax)

## ---- taxa-tree-abundances ----
tax_abund <- tree_counts_multi(as.matrix(tax_tree$el),
                               tax_tree$inv_mapping,
                               counts, sample_info)
sprintf("var tax_abund = %s", toJSON(tax_abund, auto_unbox = T)) %>%
  cat(file = file.path("data", "tax_abund.js"))

## ---- phy-json ----
# create a json object representing edges
node_ages <- node.age(phy_tree(PS))$ages
el <- data.frame(phy_tree(PS)[["edge"]],
                 phy_tree(PS)[["edge.length"]],
                 node.age(phy_tree(PS))$age)
el[, 1] <- phy_mapping[el[, 1]]
el[, 2] <- phy_mapping[el[, 2]]
colnames(el) <- c("parent", "child", "length", "depth")
res <- tree_json(el, "1")
sprintf("var phy_tree = %s", toJSON(res, auto_unbox = T)) %>%
  cat(file = file.path("data", "phy_tree.js"))

## ---- tax-tree-json ----
el <- tax_tree$el
el[, 1] <- tax_tree$inv_mapping[el[, 1]]
el[, 2] <- tax_tree$inv_mapping[el[, 2]]
colnames(el) <- c("parent", "child")
res <- tree_json(el, "K:Bacteria")
sprintf("var tax_tree = %s", toJSON(res, auto_unbox = T)) %>%
  cat(file = file.path("data", "tax_tree.js"))
