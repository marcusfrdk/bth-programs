import json
import os
import re
import requests
import time
from bs4 import BeautifulSoup
from datetime import datetime
from threading import Thread
from fetch.course import get_course
from fetch.utils import get_times, get_place_time_of_day_and_speed, get_data_path

def get_program_codes() -> dict:
  semesters = []
  
  try:
    res = requests.get("https://edu.bth.se/utbildning/programoversikt.asp", timeout=10)
  except requests.exceptions.ConnectTimeout:
    return {}

  soup = BeautifulSoup(res.text, "html.parser")
  container = soup.find_all("h1")[0].parent

  for p in container.find_all("p")[2:]:
    for a in p.find_all("a"):
      semesters.append(a.get("href").split("=")[1])

  return semesters

def _get_program_plan(soup: BeautifulSoup) -> str:
  try:
    a = soup.find("h3", string="Utbildningsplan").next_sibling.next_sibling.find("a")
    return f"https://edu.bth.se{a.get('href')}" if a else ""
  except AttributeError:
    return ""

def _get_points(soup: BeautifulSoup) -> float:
  div = soup.find("div", {"id": "utb_program_omfattning_start"})
  match = re.search(r'\b(\d{1,3})\b', div.text)
  return float(match.group(1)) if match else 0.0

def _get_end(start: str, points: float) -> str:
  try:
    semesters = points // 30
    years = semesters // 2
    year, week = int(start[:4]), int(start[4:])
    week = 52 if week < 30 else 24
    return f"{int(int(year) + years)}{week}"
  except AttributeError:
    return ""

def _get_name(soup: BeautifulSoup) -> str:
  try:
    return soup.find("h1", {"id": "utb_programtitel"}).text
  except AttributeError:
    return ""

def _get_teacher(soup: BeautifulSoup) -> str:
  try:
    return soup.find("h3", string="Programansvarig").next_sibling.next_sibling.text
  except AttributeError:
    return ""

def _get_location(soup: BeautifulSoup) -> str:
  try:
    return soup.find("h3", string="Ort").next_sibling.next_sibling.text
  except AttributeError:
    return "Karlskrona"
  
def is_private(soup: BeautifulSoup) -> bool:
  """ Checks if a program page is marked as private """ 
  try:
    for h1 in soup.find_all("h1"):
      if h1.text.strip().lower() == "meddelande":
        return True
    return False
  except AttributeError:
    return False

def get_program(code: str) -> None:
  print(f"=== Getting '{code}' ===")

  program_url = f"https://edu.bth.se/utbildning/utb_program.asp?PtKod={code}&lang=sv"
  
  res = requests.get(program_url)
  if res.status_code != 200:
    print(f"Failed getting page for program '{code}' with error {res.status_code}, skipping...")
    return None
  
  soup = BeautifulSoup(res.text, "html.parser")
  if is_private(soup):
    print(f"'{code}' is private, skipping...")
    return None

  # Program metadata
  name = _get_name(soup)
  points = _get_points(soup)
  location = _get_location(soup)
  place, time_of_day, speed = get_place_time_of_day_and_speed(soup)
  teacher = _get_teacher(soup)
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
    "program_url": program_url,
    "program_plan": program_plan,
    "start": start,
    "end": end,
    "generated": str(datetime.now()),
    "courses": courses
  }

  data_path = get_data_path()
  file_path = os.path.join(data_path, f"{code}.json")

  with open(file_path, "w+", encoding="utf-8") as f:
    f.write(json.dumps(program, indent=2))

  print(f"Saved data for '{code}' at '{file_path}'")