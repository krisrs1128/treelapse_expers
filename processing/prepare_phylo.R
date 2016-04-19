#! /usr/bin/env Rscript

# File description -------------------------------------------------------------

# Setup packages ---------------------------------------------------------------
# List of packages for session
.packages  <-  c("data.table",
                 "plyr",
                 "phangorn",
                 "jsonlite",
                 "phyloseq",
                 "dplyr")

# Install CRAN packages (if not already installed)
.inst <- .packages %in% installed.packages()
if(any(!.inst)) {
  install.packages(.packages[!.inst], repos = "http://cran.rstudio.com/")
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

## ---- get-data ----
pregnancy_path <- "http://statweb.stanford.edu/~susan/papers/Pregnancy/PregnancyClosed15.Rdata"
tmp <- tempfile()
download.file(pregnancy_path, tmp)
load(tmp)

#PS <- PS %>% subset_taxa(Class == "C:Clostridia")

## --- sample data ----
Z <- sample_data(PS)[, c("DateColl", "SubjectID")] %>%
  data.frame(check.names = F)
colnames(Z) <- c("date", "subject")
#Z <- Z[Z$subject %in% c("10043", "10040", "10032"), ]
Z <- Z[Z$subject %in% c("10032"), ]

Z$date <- strptime(Z$date, "%m/%d/%y %H:%M")
Z$date <- paste(month(Z$date), mday(Z$date), year(Z$date), sep = "-")
Z$date <- as.factor(Z$date)
X <- otu_table(PS) %>%
  data.frame(check.names = F)
X <- X[rownames(X) %in% rownames(Z), ]

# get counts at different levels in the tree associated with the first sample
Z$subject <- droplevels(Z$subject)
Z$date <- droplevels(Z$date)

phy_tree(PS)$node.label <- seq_along(phy_tree(PS)$node.label)
phy_names <- c(phy_tree(PS)$node.label, phy_tree(PS)$tip.label)

unique_dates <- unique(Z$date)
unique_subjects <- unique(Z$subject)
abund <- replicate(length(unique_subjects),
                   matrix(0, nrow = length(phy_names),
                          ncol = length(unique_dates),
                          dimnames = list(phy_names, unique_dates)),
                   simplify = FALSE)
    
for (i in seq_along(unique_subjects)) {
  cat(sprintf("Processing subject %s\n", unique_subjects[i]))
  for(j in seq_along(unique_dates)) {
    cur_ix <- which(Z$subject %in% unique_subjects[i] &
                              Z$date %in% unique_dates[j])
    cur_X <- colSums(X[cur_ix, ])
    counts <- tree_counts(phy_tree(PS), unlist(cur_X))
    counts <- setNames(counts$count, counts$label)
    abund[[i]][ , j] <- log(1 + counts[match(rownames(abund[[i]]), names(counts))]) %>%
      round(digits = 2)
  }
}

names(abund) <- unique_subjects
abund <- abund %>% lapply(
  function(z) {
    result <- list()
    for (i in seq_len(nrow(z))) {
      result[[i]] <- data.frame(time = colnames(z), value = z[i, ])
      rownames(result[[i]]) <- NULL
    }
    names(result) <- rownames(z)
    return (result)
  }
)

sprintf("var abund = %s", toJSON(abund, auto_unbox = T)) %>%
  cat(file = file.path("data", "abund.js"))

# create a json object representing edges
phy_names <- c(phy_tree(PS)$tip.label, phy_tree(PS)$node.label)
el <- data.frame(phy_tree(PS)[["edge"]], phy_tree(PS)[["edge.length"]])
el[, 1] <- phy_names[el[, 1]]
el[, 2] <- phy_names[el[, 2]]
colnames(el) <- c("parent", "child", "length")
res <- tree_json(el, "1")
sprintf("var tree = %s", toJSON(res, auto_unbox = T)) %>%
  cat(file = file.path("data", "tree.js"))

# Tidy things up ---------------------------------------------------------------
cat("\014")  # Clear console

# Scratchpad -------------------------------------------------------------------

