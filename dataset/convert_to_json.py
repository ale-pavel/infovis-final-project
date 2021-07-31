#!/usr/bin/env python3
import csv
import json

nodes_json = []
edges_json = []
graph_json = {}

with open('graph_nodes.csv') as nodes:
	csv_reader = csv.reader(nodes, delimiter=',')
	next(csv_reader)
	fields_list = ["id", "label", "gender", "gender_description", "chapter", "page"]

	for row in csv_reader:
		obj = {}
		for i, field in enumerate(fields_list):
			obj[field] = row[i]
		nodes_json.append(obj)

with open('graph_edges.csv') as edges:
	csv_reader = csv.reader(edges, delimiter=',')
	next(csv_reader)
	fields_list = ["source", "target", "action", "action_description", "chapter", "page"]

	for row in csv_reader:
		obj = {}
		for i, field in enumerate(fields_list):
			obj[field] = row[i]
		edges_json.append(obj)

graph_json['nodes'] = nodes_json
graph_json['links'] = edges_json

with open('graph.json', 'w') as json_file:
	json_file.write(json.dumps(graph_json, indent=4))
