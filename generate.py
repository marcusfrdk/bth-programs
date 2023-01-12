""" 
Fetches and downloads all programs and courses available on BTH.

If a course is not generated, this is likely caused by it being "private"
or something failed during generation.

The program assumes that no two programs share data (except from data of insignificant size).
It also assumes courses differ between years of a program.
"""

import json
import os
import numpy as np
import parse
import re
import utils
import shutil
import traceback
from bs4 import BeautifulSoup
from datetime import datetime
from threading import Thread
from typing import Callable

failed: list[str] = []


def start_threads(fn: Callable, values: list, **kwargs) -> None:
  """ 
  Function to start multithreading

  fn(chunk: list, int: int) -> None
  values: list

  The callback functions first argument is a list of values (same as provided) but split into sizable chunks.
  The index is the chunk index.
  """
  threads: list[Thread] = []
  chunks = np.array_split(values, min(os.cpu_count(), len(values)))
  for chunk in chunks:
    thread = Thread(target=fn, args=(chunk,), kwargs=kwargs)
    threads.append(thread)
    thread.start()
  for thread in threads:
    thread.join()


def get_course(url: str):
  soup = utils.fetch(url)
  data = {}
  data["url"] = url
  try:
    code = parse.get_course_code(soup)
    utils.log(f"Hämtar information on kursen {code}...", "info")
    start, end = parse.get_time(soup, True)
    data["name"] = parse.get_name(soup, True)
    data["city"] = parse.get_city(soup)
    data["study_plan"] = parse.get_study_plan(soup, True)
    data["form"] = parse.get_form(soup)
    data["speed"] = parse.get_speed(soup)
    data["location"] = parse.get_location(soup)
    data["code"] = code
    data["points"] = parse.get_points(soup, True)
    data["languages"] = parse.get_languages(soup, True)
    data["teachers"] = parse.get_course_teachers(soup)
    data["description"] = parse.get_course_description(soup)
    data["requirements"] = parse.get_course_requirements(soup)
    data["start"] = start
    data["end"] = end
    return data
  except (ValueError, AttributeError):
    utils.log(
        f"Något gick fel med att generera '{url}', endast länken sparas.", "varning")
    return data


def fetch_courses(urls: list, **kwargs) -> None:
  if kwargs:
    for url in urls:
      course = get_course(url)
      if course:
        kwargs["output"].append(course)


def get_courses(soup: BeautifulSoup):
  required_urls, optional_urls = parse.get_program_courses(soup)
  required_courses = []
  optional_courses = []
  fetch_courses(start_threads(
      fetch_courses, required_urls, output=required_courses))
  fetch_courses(start_threads(
      fetch_courses, optional_urls, output=optional_courses))
  return required_courses, optional_courses


def get_program(url: str) -> None:
  code = parse.get_program_code(url)
  utils.log(f"Hämtar information om programmet {code}...", "info")
  try:
    soup = utils.fetch(url)
    required_courses, optional_courses = get_courses(soup)
    start, end = parse.get_time(soup, False)
    data = {
        "name": parse.get_name(soup, False),
        "city": parse.get_city(soup),
        "study_plan": parse.get_study_plan(soup, False),
        "form": parse.get_form(soup),
        "speed": parse.get_speed(soup),
        "location": parse.get_location(soup),
        "code": code,
        "points": parse.get_points(soup, False),
        "languages": parse.get_languages(soup, False),
        "teacher": parse.get_program_teacher(soup),
        "url": parse.get_program_url(soup),
        "required_courses": required_courses,
        "optional_courses": optional_courses,
        "start": start,
        "end": end,
        "generated": str(datetime.now())
    }
    fp = os.path.join(utils.data_path, f"{code}.json")
    with open(fp, "w", encoding="utf-8") as f:
      f.write(json.dumps(data, indent=2))
    utils.log(f"Programmet {code} sparades", "lyckat")
  except AttributeError:
    traceback.print_exc()
    utils.log(f"Programmet {code} är inte publik ännu", "varning")
  except ValueError:
    utils.log(f"Misslyckades att generera {code} ", "varning")
    traceback.print_exc()
    failed.append(code)


def get_programs(programs: list[str, dict]) -> None:
  for years in programs:
    for url in list(years.values()):  # [:1]: # limit number of programs
      get_program(url)


def get_codes() -> list[str, dict]:
  soup = utils.fetch(utils.edu_overview_url)
  programs = {}
  results = soup.find("div", {"class": "inner-content"}).children
  children = list(filter(lambda c: c != "\n", results))
  for child in children[5:]:
    code = child.text[child.text.find("(") + 1: child.text.find(")")]
    years = {re.sub(r"[^0-9]", "", a.text): f"{utils.edu_base_url}/{a['href']}" for a in child.find_all("a")}
    programs[code] = years
  return list(programs.values())


def generate_index():
  files = [file for file in os.listdir(utils.data_path) if ".json" in file]
  with open(utils.index_path, "w+", encoding="utf-8") as f:
    f.write(json.dumps(files, indent=2))
  utils.log("En index-fil har genererats", "info")


def init():
  """ Initializes required directories and files. """
  if os.path.exists(utils.log_path_generate):
    os.remove(utils.log_path_generate)

  if os.path.isdir(utils.data_path):
    shutil.rmtree(utils.data_path)
  os.makedirs(utils.data_path)


def main() -> int:
  init()
  # [:1]) # limit years per program
  start_threads(get_programs, get_codes()[:1])
  generate_index()
  return 0


if __name__ == "__main__":
  exit(main())
