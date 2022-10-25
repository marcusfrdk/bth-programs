""" Get all unique course codes """

import os
import json

if __name__ == "__main__":
  data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
  codes = []

  for file in os.listdir(data_path):
    if file.endswith(".json") and "index.json" not in file:
      with open(os.path.join(data_path, file), 'r') as f:
        data = json.loads(f.read())
        for course in data["courses"]:
          codes.append(course["code"].lower()[0:2])

  print(sorted(list(set(codes))))
