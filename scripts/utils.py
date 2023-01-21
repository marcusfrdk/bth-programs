import json
import numpy as np
import os
import re
from bs4 import BeautifulSoup
from datetime import datetime
from urllib import parse
from threading import Thread
from typing import Callable

EDU_ROOT_URL = "https://edu.bth.se"
EDU_BASE_URL = f"{EDU_ROOT_URL}/utbildning"
EDU_OVERVIEW_URL = f"{EDU_BASE_URL}/programoversikt.asp"

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
data_path = os.path.join(root_path, "static", "data")
log_path = os.path.join(root_path, "generate.log")
index_path = os.path.join(data_path, "index.json")

def confirm(prompt: str) -> bool:
  return input(f"{prompt} (y/n) ").lower() in ["y", "yes"]


def log(msg) -> None:
  print(msg)
  with open(log_path, "a", encoding="utf-8") as f:
    f.write(f"{datetime.now()} {msg}\n")


def crash(msg: str) -> None:
  log(msg)
  exit(1)

def pretty(o: dict | list) -> None:
  log(json.dumps(o, indent=2))

def split_array(arr: list):
  try:
    return np.array_split(arr, max(1, min(os.cpu_count(), len(arr))))
  except ValueError:
    return arr

def start_threads(fn: Callable, values: list, **kwargs) -> None:
  """ 
  Function to start multithreading

  fn(chunk: list, int: int) -> None
  values: list

  The callback functions first argument is a list of values (same as provided) but split into sizable chunks.
  The index is the chunk index.
  """
  threads: list[Thread] = []
  chunks = split_array(values)
  for chunk in chunks:
    thread = Thread(target=fn, args=(chunk,), kwargs=kwargs)
    threads.append(thread)
    thread.start()
  for thread in threads:
    thread.join()

def get_city(soup: BeautifulSoup) -> str:
  result = soup.find("h3", string="Ort")
  if not result:
    raise ValueError()
  return result.nextSibling.nextSibling.text


def get_time(soup: BeautifulSoup, is_course: bool) -> tuple:
  string = "Kurstid" if is_course else "Programtid"
  result = soup.find("h3", string=string)
  if not result:
    raise ValueError()
  result = result.nextSibling.nextSibling.text
  times = result.split("until" if "until" in result else "till")
  return tuple(map(lambda v: v.strip(), times))


def get_study_plan(soup: BeautifulSoup, is_course: bool) -> str:
  try:
    string = "Kursplan" if is_course else "Utbildningsplan"
    result = soup.find("h3", string=string)
    if not result:
      raise ValueError()
    result = result.nextSibling.nextSibling.find("a")["href"]
    if "http" not in result:
      result = EDU_ROOT_URL + result
    return result
  except TypeError:
    log(f"Kunde inte spara kursplanen för {(get_course_code if is_course else get_program_code)(soup)}...")
    return ""


def get_program_url(soup: BeautifulSoup) -> str:
  result = soup.find("a", string="Programmets hemsida")
  if not result:
    raise ValueError()
  return result["href"]


def get_form_base(soup: BeautifulSoup) -> str:
  result = soup.find("h3", string="Undervisningsform")
  if not result:
    raise ValueError()
  return result.nextSibling.nextSibling.text.strip()


def get_form(soup: BeautifulSoup) -> str:
  return get_form_base(soup).split(",")[0]


def get_speed(soup: BeautifulSoup) -> int:
  """ Returns a percentage as an integer. """
  form = get_form_base(soup).strip().lower()
  if not form or "heltid" in form:
    return 100
  return int(re.sub(r"[^0-9]", "", form))


def get_location(soup: BeautifulSoup) -> str:
  return get_form_base(soup).split(",")[0].strip()


def get_program_code(url: str) -> str:
  return parse.parse_qs(parse.urlsplit(url).query).get("PtKod")[0] or ""


def get_course_code(soup: BeautifulSoup) -> str:
  result = soup.find("h1", {"id": "utb_kurstitel"})
  if not result:
    raise ValueError()
  return result.text.split(" ")[0]


def get_name(soup: BeautifulSoup, is_course: bool) -> str:
  html_id = "utb_kurstitel" if is_course else "utb_programtitel"
  result = soup.find("h1", {"id": html_id})
  if not result:
    raise ValueError()
  return (" ".join(result.text.split(" ")[1:]) if is_course else result.text).strip()


def get_points(soup: BeautifulSoup, is_course: bool) -> float:
  html_id = "utb_program_omfattning_start"
  result = soup.find("div", {"id": html_id})
  if not result:
    raise ValueError()
  result = result.text.strip().replace(",", ".")
  if not is_course:
    return float(result.split(" ")[0])
  return float(result.lower().split("högskolepoäng")[0].strip().split(" ")[-1])


def get_languages(soup: BeautifulSoup, is_course: bool) -> list[str]:
  string = "Undervisningsspråk" if is_course else "Språk"
  result = soup.find("h3", string=string)
  if not result:
    raise ValueError()
  result = result.nextSibling.nextSibling.text.lower()
  languages = []
  if "svenska" in result or "swedish" in result:
    languages.append("Svenska")
  if "engelska" in result or "english" in result:
    languages.append("Engelska")
  return languages


def get_course_teachers(soup: BeautifulSoup) -> list[str]:
  results = soup.find_all("span")
  spans = [span.find("a").text for span in results if span.find("a")]
  return list(set(spans))


def get_program_teacher(soup: BeautifulSoup) -> str:
  result = soup.find("h3", string="Programansvarig")
  if not result:
    raise ValueError()
  return result.nextSibling.nextSibling.text


def get_course_description(soup: BeautifulSoup) -> str:
  result = soup.find("h2", string="Syfte")
  if not result:
    raise ValueError()
  result = result.nextSibling.text.strip()
  # VVV - Lazy fix for courses with a description including <ul> list tags.
  if ":" in result:
    return ""
  return result


def get_course_requirements(soup: BeautifulSoup) -> str:
  result = soup.find("h2", string="Förkunskapskrav")
  if not result:
    raise ValueError()
  return result.nextSibling.text.strip()


def get_program_courses(soup: BeautifulSoup) -> tuple:
  wrapper = soup.find("div", {"id": "utb_dragspel_kurser"})
  if not wrapper:
    raise ValueError()
  semesters = wrapper.find_all("div", {"class": "utb_dragspel_kurser_content"})

  optional: list[str] = []
  required: list[str] = []

  for semester in semesters:
    children = list(
        filter(lambda v: v != "\n" and v.name != "br", semester.children))
    headings = [el for el in enumerate(children) if el[1].name == "h4"]
    elements = [(i, el.find("a")["href"])
                for i, el in enumerate(children) if el.name == "div"]

    for i, el in elements:
      if len(headings) > 1:
        optional_last = "Valbar" in headings[1][1].text
        first_list = required if optional_last else optional
        second_list = optional if optional_last else required
        (first_list if i < headings[1]
         [0] else second_list).append(f"{EDU_BASE_URL}/{el}")
      else:
        required.append(f"{EDU_BASE_URL}/{el}")

  return required, optional
