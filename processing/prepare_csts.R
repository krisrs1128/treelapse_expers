#! /usr/bin/env Rscript

# File description -------------------------------------------------------------

# Setup packages ---------------------------------------------------------------
# List of packages for session
.packages  <-  c("data.table",
                 "plyr",
                 "igraph",
                 "cluster",
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
site <- "Vaginal_Swab"
ps <- PSPreg[[site]]
tt <- data.frame(tax_table(ps))
ps <- transform_sample_counts(ps, function(OTU) OTU/sum(OTU))

braydist <- phyloseq::distance(ps, method="bray")
ord = ordinate(ps, method = "MDS", distance = braydist)
K <- 5
x <- ord$vectors[,1:7]
clust <- as.factor(pam(x, k=K, cluster.only=T))
clust[clust==2] <- NA
clust[clust==3] <- 2
clust[is.na(clust)] <- 3
sample_data(ps)$CST <- clust

sample_info <- sample_data(ps) %>%
  as.data.frame()
sample_info <- sample_info[, c("SampleID", "D2Del", "SubjectID", "CST")]
colnames(sample_info) <- c("sample_id", "rel_day", "subject", "cst")

PS <- PS %>%
  filter_taxa(function(x) sum(x > 1) > 0.01 * length(x), TRUE)

## ---- otu-counts ----
counts <- otu_table(PS) %>%
  data.frame(check.names = F)

counts$sample_id <- rownames(counts)
cst <- unlist(sample_info$cst)
counts$cst <- cst[match(rownames(counts), sample_info$sample_id)]
counts <- counts[!is.na(counts$cst), ]

counts <- counts %>%
  melt(id.vars = c("sample_id", "cst")) %>%
  group_by(variable, cst) %>%
  summarise(mean_value = mean(value)) %>%
  dcast(variable ~ cst)

rownames(counts) <- counts$variable
counts$variable <- NULL
counts <- t(as.matrix(counts))

## ---- phy-tree-abundances ----
sample_info <- data.frame("sample_id" = c("cst_1", "cst_2", "cst_3", "cst_4", "cst_5"),
                          "rel_day" = rep(1, 5),
                          "subject" = c("cst_1", "cst_2", "cst_3", "cst_4", "cst_5"))
rownames(counts) <- sample_info$sample_id

el <- phy_tree(PS)$edge
phy_mapping <- c(phy_tree(PS)$tip.label, seq_along(phy_tree(PS)$node.label))
phy_mapping <- setNames(phy_mapping, seq_along(phy_mapping))
phy_abund <- tree_counts_multi(el, phy_mapping, counts, sample_info)

sprintf("var cst_phy_abund = %s", toJSON(phy_abund, auto_unbox = T)) %>%
  cat(file = file.path("data", "cst_phy_abund.js"))

## ---- taxonomy-tree ----
tax <- tax_table(PS)@.Data
for (i in seq_len(nrow(tax))) {
  tax[i, ] <- make.names(tax[i, ], unique = TRUE)
}

tax <- cbind(tax, OTU = rownames(tax))
tax_tree <- tree_from_taxa(tax)

## ---- taxa-tree-abundances ----
tax_abund <- tree_counts_multi(as.matrix(tax_tree$el),
                               tax_tree$inv_mapping,
                               counts, sample_info)
sprintf("var cst_tax_abund = %s", toJSON(tax_abund, auto_unbox = T)) %>%
  cat(file = file.path("data", "cst_tax_abund.js"))

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
sprintf("var cst_phy_tree = %s", toJSON(res, auto_unbox = T)) %>%
  cat(file = file.path("data", "cst_phy_tree.js"))

## ---- tax-tree-json ----
el <- tax_tree$el
el[, 1] <- tax_tree$inv_mapping[el[, 1]]
el[, 2] <- tax_tree$inv_mapping[el[, 2]]
colnames(el) <- c("parent", "child")
res <- tree_json(el, "Bacteria")
sprintf("var cst_tax_tree = %s", toJSON(res, auto_unbox = T)) %>%
  cat(file = file.path("data", "cst_tax_tree.js"))
