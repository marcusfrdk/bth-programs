import re
import requests
from bs4 import BeautifulSoup, NavigableString, Tag
from fetch.utils import get_times

def _get_time(soup: BeautifulSoup) -> tuple[str, str]:
  return get_times(soup.find("h3", string="Kurstid").next_sibling.next_sibling.text)

def _get_name_and_code(soup: BeautifulSoup) -> tuple[str, str]:
  text = soup.find("h1").text.split(" ")
  return " ".join(text[1:]), text[0]

def _get_location(soup: BeautifulSoup) -> str:
  return soup.find("h3", string="Ort").next_sibling.next_sibling.text

def _get_languages(soup: BeautifulSoup) -> list[str]:
  result = soup.find("h3", string="Undervisningsspråk")
  result = result.nextSibling.nextSibling.text.lower()
  languages = []
  if "svenska" in result or "swedish" in result:
    languages.append("svenska")
  if "engelska" in result or "english" in result:
    languages.append("engelska")
  return languages

def _get_points(soup: BeautifulSoup) -> float:
  div = soup.find("div", {"id": "utb_program_omfattning_start"})
  div = div.text.strip().replace(",", ".")
  return float(div.lower().split("högskolepoäng")[0].strip().split(" ")[-1])

def _get_place_time_of_day_and_speed(soup: BeautifulSoup) -> tuple[str, str, str]:
  text = soup.find("h3", string="Undervisningsform").next_sibling.next_sibling.text.lower()
  place = "Campus" if "campus" in text else "Distans"
  time_of_day = "Dag" if "dagtid" in text else "Kväll"
  speed = int(re.search(r"\d+%", text).group(0)) if re.search(r"\d+%", text) else 50
  return place, time_of_day, speed

def _get_study_plan(soup: BeautifulSoup) -> str:
  a = soup.find("h3", string="Kursplan").next_sibling.next_sibling.find("a")
  return a.get("href") if a else ""

def _has_requirements(requirements: str) -> bool:
  return "avklar" in requirements

def _get_description_requirements_and_teachers(soup: BeautifulSoup) -> tuple[str, str, list[str]]:
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

def _get_semester(start: str) -> int:
  week = int(start[4:])
  if week < 10:
    return 3
  elif week < 25:
    return 4
  elif week < 40:
    return 1
  else:
    return 2

def get_course(url: str, is_optional: bool, lst: list):
  url = f"https://edu.bth.se/utbildning/{url}"
  res = requests.get(url)
  soup = BeautifulSoup(res.text, "html.parser")

  name, code = _get_name_and_code(soup)
  place, time_of_day, speed = _get_place_time_of_day_and_speed(soup)
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
    "semester": _get_semester(start),
    "study_plan": _get_study_plan(soup),
    "location": _get_location(soup),
    "languages": _get_languages(soup),
    "points": _get_points(soup),
    "teachers": teachers
  }

  lst.append(course)

  print(f"Downloaded '{name} ({code})'")