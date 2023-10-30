import os
import re
from bs4 import BeautifulSoup

def get_data_path() -> str:
  data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app", "static", "data"))
  os.makedirs(data_path, exist_ok=True)
  return data_path

def get_times(p: str) -> tuple:
  """ Extracts the year and week number from the time interval format of the site """ 
  start, end = "", ""
  for i, time in enumerate(p.split("until" if "until" in p else "till")):
    year, week = time.strip().split(" ")[0:3:2]
    week = "0" + week if len(week) == 1 else week

    if i == 0:
      start = year + week
    else:
      end = year + week

  return start, end

def get_place_time_of_day_and_speed(soup: BeautifulSoup) -> tuple[str, str, str]:
  try:
    text = soup.find("h3", string="Undervisningsform").next_sibling.next_sibling.text.lower()
    place = "Campus" if "campus" in text else "Distans"
    time_of_day = "Dag" if "dagtid" in text else "Kväll"

    if re.search(r"\d+%", text):
      speed = int(re.search(r"\d+%", text).group(0))
    elif re.search(r"heltid", text.lower()):
      speed = 100
    else:
      speed = 50
    
    return place, time_of_day, speed
  except AttributeError:
    return "Campus", "Dagtid", 50

def get_semester(start: str) -> int:
  week = int(start[4:])
  if week < 10:
    return 3
  elif week < 25:
    return 4
  elif week < 40:
    return 1
  else:
    return 2