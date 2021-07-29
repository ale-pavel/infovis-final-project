#!/usr/bin/env python3
import pandas as pd

all_sheets = pd.ExcelFile('hrafnkel_saga_network.xlsx')
name_list = ['hrafnkel_nodes', 'hrafnkel_edges', 'action_codes', 'gender_codes']

for name in name_list:
    df = pd.read_excel(all_sheets, name)
    df.to_csv(f'{name}.csv', index=False)
