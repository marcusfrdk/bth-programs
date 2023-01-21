import json
import os
import utils
import re
import requests
import shutil
import traceback
from bs4 import BeautifulSoup
from datetime import datetime

def get_course(url: str):
  res = requests.get(url)
  soup = BeautifulSoup(res.text, "html.parser")
  data = {"url": url}
  try:
    code = utils.get_course_code(soup)
    utils.log(f"Getting information about the course {code}...")
    start, end = utils.get_time(soup, True)
    data["name"] = utils.get_name(soup, True)
    data["city"] = utils.get_city(soup)
    data["study_plan"] = utils.get_study_plan(soup, True)
    data["speed"] = utils.get_speed(soup)
    data["location"] = utils.get_location(soup)
    data["code"] = code
    data["points"] = utils.get_points(soup, True)
    data["languages"] = utils.get_languages(soup, True)
    data["teachers"] = utils.get_course_teachers(soup)
    data["description"] = utils.get_course_description(soup)
    data["requirements"] = utils.get_course_requirements(soup)
    data["start"] = start
    data["end"] = end
    return data
  except (ValueError, AttributeError):
    utils.log(f"Failed getting course '{url}', only url is saved.")
    return data

def fetch_courses(urls: list, **kwargs) -> None:
  if kwargs:
    for url in urls:
      course = get_course(url)
      if course:
        kwargs["output"].append(course)

def get_courses(soup: BeautifulSoup):
  required_urls, optional_urls = utils.get_program_courses(soup)
  required_courses = []
  optional_courses = []
  fetch_courses(utils.start_threads(
      fetch_courses, required_urls, output=required_courses))
  fetch_courses(utils.start_threads(
      fetch_courses, optional_urls, output=optional_courses))
  return required_courses, optional_courses

def get_program_codes() -> list[dict]:
  res = requests.get(utils.EDU_OVERVIEW_URL)
  soup, programs = BeautifulSoup(res.text, "html.parser"), {}
  results = soup.find("div", {"class": "inner-content"}).children
  children = list(filter(lambda c: c != "\n", results))
  for child in children:
    code = child.text[child.text.find("(") + 1: child.text.find(")")]
    years = {re.sub(r"[^0-9]", "", a.text): f"{utils.EDU_BASE_URL}/{a['href']}" for a in child.find_all("a")}
    programs[code] = years
  return list(programs.values())[5:]

def get_program(url: str) -> None:
  code = utils.get_program_code(url)
  res = requests.get(url)
  utils.log(f"Getting information about the program '{code}'...")
  try:
    if res.status_code != 200:
      raise requests.ConnectionError()
    soup = BeautifulSoup(res.text, "html.parser")
    
    if soup.find("h1", string="Meddelande"):
      raise AttributeError("Not public")
    
    required_courses, optional_courses = get_courses(soup)
    start, end = utils.get_time(soup, False)
    data = {
        "name": utils.get_name(soup, False),
        "city": utils.get_city(soup),
        "study_plan": utils.get_study_plan(soup, False),
        "speed": utils.get_speed(soup),
        "location": utils.get_location(soup),
        "code": code,
        "points": utils.get_points(soup, False),
        "languages": utils.get_languages(soup, False),
        "teacher": utils.get_program_teacher(soup),
        "url": utils.get_program_url(soup),
        "required_courses": required_courses,
        "optional_courses": optional_courses,
        "start": start,
        "end": end,
        "generated": str(datetime.now())
    }
    fp = os.path.join(utils.data_path, f"{code}.json")
    with open(fp, "w", encoding="utf-8") as f:
      f.write(json.dumps(data, indent=2))
    utils.log(f"The program '{code}' was saved successfully")
  except requests.ConnectionError:
    utils.log(f"Failed getting '{code}' with status {res.status_code}")
  except AttributeError:
    traceback.print_exc()
    utils.log(f"The program '{code}' is not public yet.")
  except ValueError:
    utils.log(f"Failed to generate the program '{code}'")
    traceback.print_exc()

def get_programs(program_codes: list[dict]):
  for years in program_codes:
    for url in list(years.values()):
      get_program(url)

def init() -> None:
  if os.path.isdir(utils.data_path):
    if not utils.confirm("Data already exists, delete?"):
      utils.crash("Exiting...")
    shutil.rmtree(utils.data_path)
  os.makedirs(utils.data_path)

def generate_index():
  files = [file for file in os.listdir(utils.data_path) if ".json" in file]
  with open(utils.index_path, "w+", encoding="utf-8") as f:
    f.write(json.dumps(sorted(files), indent=2))
  utils.log("En index-fil har genererats")

def main() -> int:
  init()
  get_programs(get_program_codes())
  generate_index()

if __name__ == "__main__":
  exit(main())