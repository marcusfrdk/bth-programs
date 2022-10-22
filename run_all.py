from re import match

from bs4 import BeautifulSoup
from requests_html import HTMLSession

from run import generate_index, run


def is_program(href: str) -> bool:
  return bool(match(r'^https:\/\/www.bth.se\/utbildning\/program-och-kurser\/([A-Za-z]).*\/$', href))


def get_all_programs():
  """ Returns a list of all programs """
  url = "https://www.bth.se/utbildning/program-och-kurser/"
  session = HTMLSession()  # since page is CSR, a session is needed to parse Javascript.
  res = session.get(url)
  res.html.render()
  html = res.html.html
  soup = BeautifulSoup(html, "html.parser")
  return [a["href"].split("/")[-2] for a in soup.find_all("a", {"class": "program-url"}) if is_program(a["href"])]


def main():
  programs = get_all_programs()
  for program in programs:
    run(program)
  generate_index()


if __name__ == "__main__":
  main()
