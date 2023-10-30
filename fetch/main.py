import argparse
import json
import os
import time
from collections import defaultdict
from fetch.program import get_program_codes, get_program
from fetch.utils import get_data_path

def index_files() -> dict:
  data_path = get_data_path()
  index_path = os.path.join(data_path, "index.json")
  data = defaultdict(list)
  
  for file in os.listdir(data_path):
    code = file.split(".")[0][:5].upper()
    data[code].append(file)
  
  with open(index_path, "w+", encoding="utf-8") as f:
    f.write(json.dumps(data, indent=2))
  
  print("Indexed files")

def main() -> int:
  parser = argparse.ArgumentParser()
  parser.add_argument("codes", nargs="*", type=str, help="the program code(s) you want to generate data for, case-insensitive, space separated", default=get_program_codes())
  
  codes = []
  for code in vars(parser.parse_args()).get("codes"):
    codes.append(code[:5].upper() + code[5:].lower())
  
  print(f"Generating data for {len(codes)} program(s)")

  start = time.time()

  for semester in codes:
    get_program(semester)

  index_files()

  end = time.time() - start
  print(f"Generated data for {len(codes)} program(s) in {int(end)} seconds")

  return 0

if __name__ == "__main__":
  exit(main())