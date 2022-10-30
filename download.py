import itertools
import json
import multiprocessing
from multiprocessing.managers import DictProxy, ListProxy
import os
import re
import time
from typing import Callable

import numpy as np
from bs4 import BeautifulSoup
from requests_html import HTMLSession

programs_base_url = "https://www.bth.se/utbildning/program-och-kurser/"
study_plans_base_url = "https://edu.bth.se/utbildningsplaner/"

root_path = os.path.abspath(os.path.dirname(__file__))
courses_path = os.path.join(root_path, "courses.json")
course_urls_path = os.path.join(root_path, "course_urls.json")
data_path = os.path.join(root_path, "data")
index_path = os.path.join(data_path, "index.json")
study_plans_path = os.path.join(root_path, "study_plans")
study_plans_index_path = os.path.join(study_plans_path, "index.json")

program_url_regex = r'^https:\/\/www.bth.se\/utbildning\/program-och-kurser\/([A-Za-z]).*\/$'
course_code_regex = r"([A-Z]){2}([0-9]){4}"
course_points_regex = r"([0-9]{1,}(,[0-9])?) högskolepoäng"

second = 1000
minute = 60 * second
hour = 60 * minute
day = 24 * hour
week = 7 * day
month = 30 * day


def current_time() -> int:
  """ Gets the current time in ms since epoch (timestamp) """
  return int(time.time_ns() / 1e6)


def get_cache(path: str, ttl: int):
  try:
    if os.path.exists(path):
      with open(path, "r") as f:
        cache = json.load(f)
        ts = cache.get("time")
        if current_time() - ts < ttl:
          return cache.get("data")
  except json.decoder.JSONDecodeError:
    return None


def set_cache(path: str, data: dict | list) -> None:
  with open(path, "w", encoding="utf-8") as f:
    f.write(json.dumps({
      "time": current_time(),
      "data": data
    }, indent=2))


def fetch_csr(url: str, retries=3) -> BeautifulSoup | None:
  """ Fetches a url syncronously and returns the parsed html """
  with HTMLSession() as session:
    res = session.get(url)
    res.html.render(timeout=30000)  # timeout is in ms
    print(res.status_code, url)
    if res.status_code == 200:
      session.close()
      return BeautifulSoup(res.html.html, 'html.parser')
    if retries > 0:
      return fetch_csr(url, retries - 1)
    return None


def get_all_programs() -> list[str]:
  """ Returns a list of all program codes """
  soup = fetch_csr(programs_base_url)
  programs = []
  for a in soup.find_all("a", {"class": "program-url"}):
    if re.match(program_url_regex, a["href"]):
      programs.append(a["href"].split("/")[-2])
  return programs


def batch(iterable: list, fn: Callable, struct: list | dict) -> list:
  chunks = np.array_split(iterable, os.cpu_count())
  manager = multiprocessing.Manager()
  results = manager.list() if isinstance(struct, list) else manager.dict()
  threads = []

  def worker_list(chunk: list):
    for item in chunk:
      results.append(fn(item))

  def worker_dict(chunk: list):
    for item in chunk:
      key, value = fn(item)
      results[key] = value

  worker = worker_list if isinstance(struct, list) else worker_dict

  for chunk in chunks:
    p = multiprocessing.Process(target=worker, args=(chunk,))
    p.start()
    threads.append(p)

  for p in threads:
    p.join()

  if isinstance(results, ListProxy):
    if len(results) > 0 and isinstance(results[0], list):
      return list(itertools.chain(*results))
    return list(results)
  elif isinstance(results, DictProxy):
    return dict(results)
  else:
    print(type(results), results)
    raise ValueError("Got invalid type for results in batch")


def get_all_course_urls(programs: list[str]) -> list:
  """ Returns a list of all course urls """
  cache = get_cache(course_urls_path, month)
  if cache:
    return cache

  def get_urls(program: str):
    """ Fetches all course urls for a program """
    url = f"{programs_base_url}{program}"
    soup = fetch_csr(url)
    elements = soup.find(id="collapse-courses")
    if elements:
      return [a["href"] for a in elements.find_all("a")]
    else:
      return get_urls(program)

  urls = list(set(batch(programs, get_urls, list)))
  set_cache(course_urls_path, urls)
  return urls


def get_all_courses(programs: str) -> list:
  """ Returns a list of all courses and their data """
  urls = get_all_course_urls(programs)
  cache = get_cache(courses_path, month)
  if cache:
    return cache

  def get_course(url: str, retries=3):
    try:
      soup = fetch_csr(url)

      name = soup.find("h1", {"class": "Title--articleFirst"}).text
      description = soup.find("div", {"class": "Wysiwyg"}).find("p").text
      requirements = soup.find("li", {"class": "Facts-item qualifications"}
                               ).text.replace("Förkunskapskrav:", "").strip()
      code = [w.strip() for w in [li for li in soup.find_all(
          "span", {"class": "Facts-item-label-container"}) if "Kurskod:" in li.text][0].text.split()][1].lower()

      points = re.sub(r"[^0-9.,]", "", soup.find("p", {"class": "hpoints"}).text)
      points = points[1:] if "," == points[0] else points
      points = float(points.replace(",", "."))

      start = soup.find("span", {"class": "Facts-item-label-container"}).text
      start = start.replace("Studietid:", "")
      start = " ".join([w.strip() for w in start.split()])
      start = start.split("till")[0].strip()

      key = code
      value = {
        "name": name,
        "description": description,
        "points": points,
        "start": start,
        "requirements": requirements,
        "url": url
      }

      return key, value
    except AttributeError:
      if retries > 0:
        return get_course(url, retries - 1)

  courses = batch(urls, get_course, dict)
  set_cache(courses_path, courses)
  return courses


def get_study_plans(programs: str) -> None:
  # get plans
  # generate index
  pass


def get_course(url: str):
  pass


def get_courses(courses: list[str]) -> None:
  pass


def generate_index() -> None:
  pass


def main():
  programs = get_all_programs()
  courses = get_all_courses(programs)
  print(len(courses))
  # get_study_plans(programs)
  # get_courses(courses)


if __name__ == "__main__":
  main()
