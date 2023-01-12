""" 
Fixes programs and courses that failed in the initial generation. 

Requires a data/ folder with some data. 
"""

import os
import utils
import typing


def log(msg: str, prefix: typing.Literal["info", "varning"] = "info") -> None:
  utils.log(msg, prefix, utils.log_path_fix_generate)


def check_data() -> bool:
  return os.path.isdir(utils.data_path) and True in [True for file in os.listdir(utils.data_path) if ".json" in file]


def check_program(fp: str) -> list[str]:
  """ 
  Loops through required-, and optional courses to check if they are valid
  else urls are returned
  """
  pass


def main() -> int:
  if not check_data():
    log("Datamappen är ogiltig eller finns inte", "varning")
    return 1
  return 0


if __name__ == "__main__":
  exit(main())
