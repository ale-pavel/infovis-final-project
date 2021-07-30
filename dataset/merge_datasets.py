#!/usr/bin/env python3
import pandas as pd

actions = pd.read_csv('action_codes.csv')
genders = pd.read_csv('gender_codes.csv')
nodes = pd.read_csv('hrafnkel_nodes.csv')
edges = pd.read_csv('hrafnkel_edges.csv')

nodes_merge = pd.merge(nodes, genders, on='gender')
nodes_cols = nodes_merge.columns.tolist()
nodes_cols_reordered = nodes_cols[:2] + ['gender', 'gender description'] + nodes_cols[3:5]
nodes_merge_reorder = nodes_merge[nodes_cols_reordered]
nodes_joined = nodes_merge_reorder.sort_values(by=['id'])

# Pandas treats columns with NaN values as float (instead of ints). Force float to match nodes.chapter float type
edges.chapter = edges.chapter.astype('float')

edges_merge = pd.merge(edges, actions, on='action')
edges_cols = edges_merge.columns.tolist()
edges_cols_reordered = edges_cols[:2] + ['action', 'action description']+ edges_cols[3:5]
edges_merge_reorder = edges_merge[edges_cols_reordered]
edges_joined = edges_merge_reorder.sort_values(by=['source', 'target'])

nodes_joined.to_csv('graph_nodes.csv', index=False)
edges_joined.to_csv('graph_edges.csv', index=False)
