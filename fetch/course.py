import re
import requests
from bs4 import BeautifulSoup, NavigableString, Tag
from fetch.utils import *

def _get_time(soup: BeautifulSoup) -> tuple[str, str]:
  return get_times(soup.find("h3", string="Kurstid").next_sibling.next_sibling.text)

def _get_name_and_code(soup: BeautifulSoup) -> tuple[str, str]:
  try:
    text = soup.find("h1").text.split(" ")
    return " ".join(text[1:]), text[0]
  except AttributeError:
    return "", ""

def _get_location(soup: BeautifulSoup) -> str:
  try: 
    return soup.find("h3", string="Ort").next_sibling.next_sibling.text
  except AttributeError:
    return "Karlskrona"

def _get_languages(soup: BeautifulSoup) -> list[str]:
  try:
    result = soup.find("h3", string="Undervisningsspråk")
    result = result.nextSibling.nextSibling.text.lower()
    languages = []
    if "svenska" in result or "swedish" in result:
      languages.append("svenska")
    if "engelska" in result or "english" in result:
      languages.append("engelska")
    return languages
  except AttributeError:
    return []

def _get_points(soup: BeautifulSoup) -> float:
  try:
    div = soup.find("div", {"id": "utb_program_omfattning_start"})
    div = div.text.strip().replace(",", ".")
    return float(div.lower().split("högskolepoäng")[0].strip().split(" ")[-1])
  except AttributeError:
    return 0.0

def _get_study_plan(soup: BeautifulSoup) -> str:
  try:
    a = soup.find("h3", string="Kursplan").next_sibling.next_sibling.find("a")
    href = a.get("href")
    if not href:
      return ""
    if re.match(r"^https?", href):
      return href
    return "https://edu.bth.se/utbildning/" + href
  except AttributeError:
    return ""

def _has_requirements(requirements: str) -> bool:
  return "avklar" in requirements

def _get_description_requirements_and_teachers(soup: BeautifulSoup) -> tuple[str, str, list[str]]:
  try:
    container = soup.find("h2", string="Syfte").parent
    sections = {}
    current_section = None

    for child in container.children:
      if child.name == "h2":
        current_section = child.text
        sections[current_section] = []
      elif current_section and isinstance(child, (NavigableString, Tag)):
        sections[current_section].append(re.sub(r"[\s\n]{2,}", "", child.text).replace("\n", ""))

    description = " ".join(sections.get("Syfte", [])).strip()
    requirements = " ".join(sections.get("Förkunskapskrav", [])).strip()
    teachers = list(set(filter(lambda x: x != "" and x not in ["Examinator", "Kursansvarig"], sections.get("Lärare", []))))
    
    return description, requirements, teachers
  except AttributeError:
    return "", "", []

def get_course(url: str, is_optional: bool, lst: list):
  url = f"https://edu.bth.se/utbildning/{url}"
  
  try:
    res = requests.get(url)
  except requests.exceptions.ConnectTimeout:
    return None
  
  if res.status_code != 200:
    return None
  
  soup = BeautifulSoup(res.text, "html.parser")

  name, code = _get_name_and_code(soup)
  place, time_of_day, speed = get_place_time_of_day_and_speed(soup)
  description, requirements, teachers = _get_description_requirements_and_teachers(soup)
  start, end = _get_time(soup)

  course = {
    "name": name,
    "code": code,
    "description": description,
    "requirements": requirements,
    "is_optional": is_optional,
    "has_requirements": _has_requirements(requirements),
    "place": place,
    "time_of_day": time_of_day,
    "speed": speed,
    "course_page": url,
    "start": start,
    "end": end,
    "semester": get_semester(start),
    "study_plan": _get_study_plan(soup),
    "location": _get_location(soup),
    "languages": _get_languages(soup),
    "points": _get_points(soup),
    "teachers": teachers
  }

  lst.append(course)

  print(f"Downloaded '{name} ({code})'")