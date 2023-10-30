import os

data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "data"))

def read_data_list() -> list[str]:
  return [file for file in os.listdir(data_path) if file.endswith(".json") and file != "index.json"]

def read_data_dict() -> dict:
  filenames = read_data_list()
  groups = {filename.split(".")[0][:5]: [] for filename in filenames}
  for filename in filenames:
      prefix = filename.split(".")[0][:5]
      groups[prefix].append(filename)
  return groups