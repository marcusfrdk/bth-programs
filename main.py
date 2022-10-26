import json
import os
import re
from typing import Callable

from bs4 import BeautifulSoup
from requests_html import HTMLSession

programs_base_url = "https://www.bth.se/utbildning/program-och-kurser/"
study_plans_base_url = "https://edu.bth.se/utbildningsplaner"

root_path = os.path.abspath(os.path.dirname(__file__))
data_path = os.path.join(root_path, "data")
study_plans_path = os.path.join(root_path, "study_plans")

program_url_regex = r'^https:\/\/www.bth.se\/utbildning\/program-och-kurser\/([A-Za-z]).*\/$'
course_code_regex = r"([A-Z]){2}([0-9]){4}"
course_points_regex = r"([0-9]{1,}(,[0-9])?) högskolepoäng"


def fetch_csr(url: str, on_error: Callable = None) -> BeautifulSoup | None:
  """ Fetches a url (static or csr) and returns the parsed html """
  session = HTMLSession()
  res = session.get(url)
  if res.status_code == 200:
    return BeautifulSoup(res.content, 'html.parser')
  on_error() if on_error else None
  return None


def init() -> None:
  """ Initializes the project """
  folders = [data_path, study_plans_path]
  for folder in folders:
    if not os.path.isdir(folder):
      os.makedirs(folder)


def generate_index() -> None:
  """ Generates an index file for all programs """
  data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))
  data = [f.replace(".json", "") for f in os.listdir(data_path) if os.path.isfile(
    os.path.join(data_path, f)) and f.endswith(".json")]
  with open(os.path.join(data_path, "index.json"), "w", encoding="utf-8") as f:
    f.write(json.dumps(data, indent=2))


if __name__ == "__main__":
  init()

  # Fetch all programs
  #
