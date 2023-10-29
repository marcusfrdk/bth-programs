import re
import requests
from bs4 import BeautifulSoup
from threading import Thread

from fetch.course import get_course

def get_program_codes() -> dict:
  semesters = []
  res = requests.get("https://edu.bth.se/utbildning/programoversikt.asp")
  soup = BeautifulSoup(res.text, "html.parser")
  container = soup.find_all("h1")[0].parent

  for p in container.find_all("p")[2:]:
    for a in p.find_all("a"):
      semesters.append(a.get("href").split("=")[1])

  return semesters


def get_program(semester: str) -> None:
  print(f"Getting '{semester}'")

  res = requests.get(f"https://edu.bth.se/utbildning/utb_program.asp?PtKod={semester}&lang=sv")
  if res.status_code != 200:
    return None
  soup = BeautifulSoup(res.text, "html.parser")

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
    break
  
  for thread in threads:
    thread.start()

  for thread in threads:
    thread.join()
  
  courses.sort(key=lambda d: int(d["start"]))

  import json
  print(json.dumps(courses, indent=2))

