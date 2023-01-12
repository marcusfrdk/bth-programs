import datetime
import json
import os
import requests
import typing
from urllib import parse
from bs4 import BeautifulSoup

root_path = os.path.abspath(os.path.dirname(__file__))
html_output_path = os.path.join(root_path, "output.html")
data_path = os.path.join(root_path, "data")
index_path = os.path.join(data_path, "index.json")
log_path_generate = os.path.join(root_path, "generate.log")
log_path_fix_generate = os.path.join(root_path, "fix-generate.log")

edu_root_url = "https://edu.bth.se"
edu_base_url = f"{edu_root_url}/utbildning"
edu_overview_url = f"{edu_base_url}/programoversikt.asp"

log_status = {
    "info": "[INFO]    ",
    "varning": "[VARNING] ",
    "lyckat": "[LYCKAT]  "
}


def log(msg: str, prefix: typing.Literal["info", "varning"], fp: str = log_path_generate) -> None:
  status = prefix if prefix in log_status else "info"
  print(f"{log_status[status]}{msg}")
  with open(log_path_generate, "a", encoding="utf-8") as f:
    f.write(f"{datetime.datetime.now()} {log_status[status]}{msg}\n")


def fetch(url: str) -> BeautifulSoup:
  res = requests.get(url)
  return BeautifulSoup(res.text, "html.parser")


def pretty(value: dict) -> str:
  return json.dumps(value, indent=2)


def url_query(url: str) -> dict:
  return parse.parse_qs(parse.urlsplit(url).query)


def format_url(url: str):
  """ A function to ensure urls stay consistent and deterministic """
  parsed = url_query(url)
  del parsed["lang"]
  return url.split("?")[0] + "?lang=sv&" + "&".join([f"{k}={v[0]}" for k, v in parsed.items()])


def export_html(soup: BeautifulSoup) -> None:
  with open(html_output_path, "w+", encoding="utf-8") as f:
    f.write(str(soup))


def has_requirements(string: str) -> bool:
  return "avklar" in string.lower()
