import json
import os
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from threading import Thread
from fetch.course import get_course
from fetch.utils import get_times, get_place_time_of_day_and_speed

def get_program_codes() -> dict:
  semesters = []
  res = requests.get("https://edu.bth.se/utbildning/programoversikt.asp")
  soup = BeautifulSoup(res.text, "html.parser")
  container = soup.find_all("h1")[0].parent

  for p in container.find_all("p")[2:]:
    for a in p.find_all("a"):
      semesters.append(a.get("href").split("=")[1])

  return semesters

def _get_program_plan(soup: BeautifulSoup) -> str:
  a = soup.find("h3", string="Utbildningsplan").next_sibling.next_sibling.find("a")
  return f"https://edu.bth.se{a.get('href')}" if a else ""

def _get_points(soup: BeautifulSoup) -> float:
  div = soup.find("div", {"id": "utb_program_omfattning_start"})
  match = re.search(r'\b(\d{1,3})\b', div.text)
  return float(match.group(1)) if match else 0.0

def _get_end(start: str, points: float) -> str:
  semesters = points // 30
  years = semesters // 2
  year, week = int(start[:4]), int(start[4:])
  week = 52 if week < 30 else 24
  return f"{int(int(year) + years)}{week}"

def _get_name(soup: BeautifulSoup) -> str:
  return soup.find("h1", {"id": "utb_programtitel"}).text

def _get_teacher(soup: BeautifulSoup) -> str:
  return soup.find("h3", string="Programansvarig").next_sibling.next_sibling.text

def _get_location(soup: BeautifulSoup) -> str:
  return soup.find("h3", string="Ort").next_sibling.next_sibling.text

def get_program(code: str) -> None:
  print(f"=== Getting '{code}' ===")

  program_url = f"https://edu.bth.se/utbildning/utb_program.asp?PtKod={code}&lang=sv"
  res = requests.get(program_url)
  if res.status_code != 200:
    return None
  soup = BeautifulSoup(res.text, "html.parser")

  # Program metadata
  name = _get_name(soup)
  points = _get_points(soup)
  location = _get_location(soup)
  place, time_of_day, speed = get_place_time_of_day_and_speed(soup)
  teacher = _get_teacher(soup)
  url = program_url
  program_plan = _get_program_plan(soup)
  start = get_times(soup.find("h3", string="Programtid").next_sibling.next_sibling.text)[0]
  end = _get_end(start, points)

  # Get the url for each course
  urls = set()

  for section_title in soup.find_all("h2", string=re.compile(r"Kurser (höst|vår)terminen \d{4}")):
    section = section_title.next_sibling.next_sibling
    is_optional_courses_urls = False
    
    for child in section.children:
      if child.name == "h4":
        is_optional_courses_urls = child.text == "Obligatoriska kurser"
      urls.add((child.find("a").get("href"), is_optional_courses_urls)) if child.name == "div" else None

  # Download the courses
  courses = []
  threads = []

  for url, is_optional in urls:
    t = Thread(target=get_course, args=(url, is_optional, courses,))
    threads.append(t)
  
  for thread in threads:
    thread.start()

  for thread in threads:
    thread.join()
  
  courses.sort(key=lambda d: int(d["start"]))

  program = {
    "code": code,
    "name": name,
    "location": location,
    "place": place,
    "speed": speed,
    "time_of_day": time_of_day,
    "points": points,
    "teacher": teacher,
    "url": url,
    "program_plan": program_plan,
    "start": start,
    "end": end,
    "generated": str(datetime.now()),
    "courses": courses
  }

  data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))
  os.makedirs(data_path, exist_ok=True)

  with open(os.path.join(data_path, f"{code}.json"), "w+", encoding="utf-8") as f:
    f.write(json.dumps(program, indent=2))