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

## ---- get-data ----
data(GlobalPatterns)
GP <- GlobalPatterns %>%
  subset_taxa(Phylum=="Chlamydiae")
rm(GlobalPatterns)


# get counts at different levels in the tree associated with the first sample
counts <- setNames(as.numeric(otu_table(GP)[, 1]), rownames(otu_table(GP)))
tree_counts(phy_tree(GP), counts)

# create a json object representing edges
phy_names <- c(phy$tip.label, phy$node.label)
el <- data.frame(phy[["edge"]], phy[["edge.length"]])
el[, 1] <- phy_names[el[, 1]]
el[, 2] <- phy_names[el[, 2]]
colnames(el) <- c("parent", "child", "length")
res <- tree_json(el, "0.930.581")
toJSON(res, auto_unbox = T)

# Tidy things up ---------------------------------------------------------------
cat("\014")  # Clear console

# Scratchpad -------------------------------------------------------------------

