import utils
import re
from bs4 import BeautifulSoup


def get_city(soup: BeautifulSoup):
  return soup.find("h3", string="Ort").nextSibling.nextSibling.text


def get_time(soup: BeautifulSoup, is_course: bool) -> tuple:
  string = "Kurstid" if is_course else "Programtid"
  result = soup.find("h3", string=string)
  if not result:
    return "", ""
  result = result.nextSibling.nextSibling.text
  return tuple(map(lambda v: v.strip(), result.split("till")))


def get_study_plan(soup: BeautifulSoup, is_course: bool) -> str:
  try:
    string = "Kursplan" if is_course else "Utbildningsplan"
    result = soup.find(
        "h3", string=string).nextSibling.nextSibling.find("a")["href"]
    if "http" not in result:
      result = utils.edu_root_url + result
    return result
  except TypeError:
    utils.log(
        f"Kunde inte spara kursplanen för {(get_course_code if is_course else get_program_code)(soup)}...", "varning")
    return ""


def get_program_url(soup: BeautifulSoup) -> str:
  result = soup.find("a", string="Programmets hemsida")
  if result:
    return result["href"]
  return ""


def get_form_base(soup: BeautifulSoup) -> str:
  return soup.find(
      "h3", string="Undervisningsform").nextSibling.nextSibling.text.strip()


def get_form(soup: BeautifulSoup) -> str:
  return get_form_base(soup).split(",")[0]


def get_speed(soup: BeautifulSoup) -> int:
  """ Returns a percentage as an integer. """
  form = get_form_base(soup).strip().lower()
  if "heltid" in form:
    return 100
  return int(re.sub(r"[^0-9]", "", form))


def get_location(soup: BeautifulSoup) -> str:
  return get_form_base(soup).split(",")[0].strip()


def get_program_code(url: str) -> str:
  return utils.url_query(url)["PtKod"][0]


def get_course_code(soup: BeautifulSoup) -> str:
  return soup.find("h1", {"id": "utb_kurstitel"}).text.split(" ")[0]


def get_name(soup: BeautifulSoup, is_course: bool) -> str:
  html_id = "utb_kurstitel" if is_course else "utb_programtitel"
  result = soup.find("h1", {"id": html_id}).text
  return (" ".join(result.split(" ")[1:]) if is_course else result).strip()


def get_points(soup: BeautifulSoup, is_course: bool) -> float:
  html_id = "utb_program_omfattning_start"
  result = soup.find("div", {"id": html_id}).text.strip().replace(",", ".")
  if not is_course:
    return float(result.split(" ")[0])
  return float(result.lower().split("högskolepoäng")[0].strip().split(" ")[-1])


def get_languages(soup: BeautifulSoup, is_course: bool) -> list[str]:
  string = "Undervisningsspråk" if is_course else "Språk"
  result = soup.find("h3", string=string).nextSibling.nextSibling.text.lower()
  languages = []
  if "svenska" in result or "swedish" in result:
    languages.append("Svenska")
  if "engelska" in result or "english" in result:
    languages.append("Engelska")
  return languages


def get_course_teachers(soup: BeautifulSoup) -> list[str]:
  results = soup.find_all("span")
  spans = [span.find("a").text for span in results if span.find("a")]
  return list(set(spans))


def get_program_teacher(soup: BeautifulSoup) -> str:
  return soup.find("h3", string="Programansvarig").nextSibling.nextSibling.text


def get_course_description(soup: BeautifulSoup) -> str:
  result = soup.find("h2", string="Syfte").nextSibling.text.strip()
  # VVV - Lazy fix for courses with a description including <ul> list tags.
  if ":" in result:
    return ""
  return result


def get_course_requirements(soup: BeautifulSoup) -> str:
  return soup.find("h2", string="Förkunskapskrav").nextSibling.text.strip()


def get_program_courses(soup: BeautifulSoup) -> tuple:
  wrapper = soup.find("div", {"id": "utb_dragspel_kurser"})
  semesters = wrapper.find_all("div", {"class": "utb_dragspel_kurser_content"})

  optional: list[str] = []
  required: list[str] = []

  for semester in semesters:
    children = list(
        filter(lambda v: v != "\n" and v.name != "br", semester.children))
    headings = [el for el in enumerate(children) if el[1].name == "h4"]
    elements = [(i, el.find("a")["href"])
                for i, el in enumerate(children) if el.name == "div"]

    for i, el in elements:
      if len(headings) > 1:
        optional_last = "Valbar" in headings[1][1].text
        first_list = required if optional_last else optional
        second_list = optional if optional_last else required
        (first_list if i < headings[1]
         [0] else second_list).append(f"{utils.edu_base_url}/{el}")
      else:
        required.append(f"{utils.edu_base_url}/{el}")

  return required, optional
