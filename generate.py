import datetime
import json
import numpy as np
import os
import threading
import re
import parse
import utils
import traceback
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor


def get_course(url: str) -> dict:
  soup = utils.fetch(url)
  try:
    code = parse.get_course_code(soup)
    utils.log(f"Hämtar information on kursen {code}...", "info")
    start, end = parse.get_time(soup, True)
    return {
        "name": parse.get_name(soup, True),
        "city": parse.get_city(soup),
        "study_plan": parse.get_study_plan(soup, True),
        "form": parse.get_form(soup),
        "speed": parse.get_speed(soup),
        "location": parse.get_location(soup),
        "code": code,
        "points": parse.get_points(soup, True),
        "languages": parse.get_languages(soup, True),
        "teachers": parse.get_course_teachers(soup),
        "description": parse.get_course_description(soup),
        "requirements": parse.get_course_requirements(soup),
        "start": start,
        "end": end
    }
  except AttributeError:
    utils.log(f"Kunde inte hämta information on kursen {url}", "varning")


def get_courses(soup: BeautifulSoup) -> dict:
  required, optional = parse.get_program_courses(soup)
  with ThreadPoolExecutor() as executor:
    required = list(executor.map(get_course, required))
  with ThreadPoolExecutor() as executor:
    optional = list(executor.map(get_course, optional))
  return required, optional


def get_program(url: str) -> None:
  code = parse.get_program_code(url)
  utils.log(f"Hämtar information om programmet {code}...", "info")
  try:
    soup = utils.fetch(url)
    required_courses, optional_courses = get_courses(soup)
    start, end = parse.get_time(soup, False)
    return {
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
        "generated": str(datetime.datetime.now())
    }
  except AttributeError:
    traceback.print_exc()
    utils.log(f"Programmet {code} är inte publik ännu", "varning")
    return None


def get_programs(urls: list[np.ndarray]):
  with ThreadPoolExecutor() as executor:
    results = executor.map(get_program, urls)
    for result in results:
      if result and "code" in result:
        fp = os.path.join(utils.data_path, f"{result['code']}.json")
        with open(fp, "w", encoding="utf-8") as f:
          f.write(json.dumps(result, indent=2))
        utils.log(f"Programmet {result['code']} sparades", "lyckat")


def get_all_programs(url: str) -> dict:
  soup = utils.fetch(url)
  programs = {}
  results = soup.find("div", {"class": "inner-content"}).children
  children = list(filter(lambda c: c != "\n", results))
  for child in children[5:]:
    code = child.text[child.text.find("(") + 1: child.text.find(")")]
    years = {re.sub(r"[^0-9]", "", a.text): f"{utils.edu_base_url}/{a['href']}" for a in child.find_all("a")}
    programs[code] = years
  return programs


def main() -> int:
  try:
    all_programs = get_all_programs(utils.edu_overview_url)
    for years in all_programs.values():
      values = list(years.values())
      chunks = np.array_split(values, min(len(values), os.cpu_count()))
      threads = []
      for chunk in chunks:
        thread = threading.Thread(target=get_programs, args=(chunk,))
        thread.start()
        threads.append(thread)
      for thread in threads:
        thread.join()
    return 0
  except:
    return 1


if __name__ == "__main__":
  exit(main())
