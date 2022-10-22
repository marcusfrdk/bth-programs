from argparse import Action, ArgumentParser
from json import dumps
from os import cpu_count, path
from re import findall, sub
from threading import Thread
from time import time_ns

from bs4 import BeautifulSoup
from numpy import array_split
from requests import get


class ProgramAction(Action):
  def __call__(self, parser, namespace, values, option_string=None):
    for value in values:
      if findall(r"[^a-z]", value):
        print(f"Program code '{value}' is not valid.")
        exit(1)
    setattr(namespace, self.dest, values)


def get_args() -> dict:
  parser = ArgumentParser(description="Program to get all the courses of a program at BTH.")
  parser.add_argument("program", help="the program code, eg. 'dvami', 'dvasi', 'paamj'",
                      nargs="+", type=str, action=ProgramAction)
  parser.add_argument("--dev", help="shows tracebacks for exceptions", action="store_true")
  return vars(parser.parse_args())


def get_time(soup: BeautifulSoup) -> tuple:
  text = soup.find("span", {"class": "Facts-item-label-container"}).text
  text = text.replace("Studietid:", "")
  text = " ".join([w.strip() for w in text.split()])
  return (w.strip() for w in text.split("till"))


def get_name(soup: BeautifulSoup) -> str:
  return soup.find("h1", {"class": "Title--articleFirst"}).text


def get_points(soup: BeautifulSoup) -> float:
  points = sub(r"[^0-9.,]", "", soup.find("p", {"class": "hpoints"}).text)
  points = points[1:] if "," == points[0] else points
  return float(points.replace(",", "."))


def get_course_hrefs(soup: BeautifulSoup) -> list:
  return [course.get("href") for course in soup.find(id="collapse-courses").find_all("a")]


def get_requirements(soup: BeautifulSoup, tag: str) -> str:
  return soup.find(tag, {"class": "Facts-item qualifications"}).text.replace("Förkunskapskrav:", "").strip()


def get_course_code(soup: BeautifulSoup) -> str:
  code = [w.strip() for w in [li for li in soup.find_all(
    "span", {"class": "Facts-item-label-container"}) if "Kurskod:" in li.text][0].text.split()]
  return code[1]


def get_metadata(soup: BeautifulSoup, req_tag: str) -> dict:
  name = get_name(soup)
  points = get_points(soup)
  start, end = get_time(soup)
  req = get_requirements(soup, req_tag)

  return {
    "name": name,
    "points": points,
    "start": start,
    "end": end,
    "requirements": req
  }


def get_program(code: str) -> dict:
  """ Gets useful information about the selected program """
  assert code is not None

  url = f"https://www.bth.se/utbildning/program-och-kurser/{code}/"
  attempt = 0
  max_attempts = 3

  while attempt < max_attempts:
    res = get(url)

    if res.status_code != 200:
      print(f"Program '{code}' is not valid.")
      attempt += 1
    else:
      attempt = max_attempts

  soup = BeautifulSoup(res.text, "html.parser")
  courses = get_course_hrefs(soup)

  return {**get_metadata(soup, req_tag="div"), "courses": courses}


def get_courses(hrefs: list) -> None:
  chunks = array_split(hrefs, cpu_count())
  threads = []
  data = []

  def _run_chunks(chunk: list, index: int) -> None:
    for href in chunk:
      attempt = 0
      max_attempts = 5
      while attempt < max_attempts:
        try:
          soup = BeautifulSoup(get(href).text, "html.parser")
          course = {
            **get_metadata(soup, req_tag="li"),
            "code": get_course_code(soup)
          }
          data.append(course)

          print(f"Successfully got info for '{href}'")
          attempt = max_attempts
        except:
          print(f"Failed getting info for '{href}', retrying...")
          attempt += 1

  for i, chunk in enumerate(chunks):
    thread = Thread(target=_run_chunks, args=(chunk, i))
    thread.start()
    threads.append(thread)

  for thread in threads:
    thread.join()

  return data


def run(code: str) -> None:
  title = f"Getting info for program '{code}'"
  print("-" * len(title))
  print(title)
  print("-" * len(title))

  program = get_program(code)
  courses = get_courses(program.get("courses"))
  data = {
    **program,
    "courses": sorted(sorted(courses, key=lambda k: k["name"]), key=lambda k: k["start"]),
    "updated": int(time_ns() / 1e6)
  }

  data_path = path.abspath(path.join(path.dirname(__file__), "data", f"{code}.json"))
  with open(data_path, "w", encoding="utf-8") as f:
    f.write(dumps(data, indent=2))


if __name__ == "__main__":
  args = get_args()
  codes = args.get("program")

  for code in codes:
    run(code)
