import argparse
import asyncio
import os
import sys
import re
import requests
import json
import numpy as np
import pandas as pd
import multiprocessing as mp
from collections import defaultdict
from io import BytesIO
from bs4 import BeautifulSoup
from pyppeteer import launch, errors
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# Mutex
process_lock = mp.Lock()

# URLs
program_url = "https://resources.bth.se/ProgrammeOverviews/Sv/"
teacher_url = "https://www.bth.se/?s=%s&searchtype=employee"

# Paths
ROOT_PATH = os.path.abspath(os.path.dirname(__file__))
DATA_PATH = os.path.join(ROOT_PATH, "app", "public", "data")
TEACHER_CSV = os.path.join(DATA_PATH, "teachers.csv")
TEACHER_JSON = os.path.join(DATA_PATH, "teachers.json")
INDEX_PATH = os.path.join(DATA_PATH, "index.json")
NAMES_PATH = os.path.join(DATA_PATH, "names.json")

# Regex
excel_regex = re.compile(r"\.xlsx$")
year_regex = re.compile(r"\d{4}")
program_regex = re.compile(r"\w{5}\d{2}[vh]\.json")

# CLI
parser = argparse.ArgumentParser(description="Generate data for the app")
parser.add_argument("-u", "--update", action="store_true", help="Updates the data")
args = vars(parser.parse_args())

# Global
teacher_codes = set()

async def fetch(url: str, retries: int = 5) -> str:
    """ Asynchronously fetches the HTML content of a webpage with retry logic """
    for attempt in range(retries):
        try:
            browser = await launch()
            page = await browser.newPage()
            await page.goto(url)
            html = await page.content()
            await browser.close()
            return html
        except errors.NetworkError as e:
            print(f"NetworkError on attempt {attempt + 1}: {e}")
            if attempt == retries - 1:
                raise
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Error on attempt {attempt + 1}: {e}")
            if attempt == retries - 1:
                raise
            await asyncio.sleep(2)

def get_program_code(url: str) -> str:
    """ Parses the url to get the program code """
    code = url.replace(" ", "").split(".")[-2].split("-")[-1]
    year = year_regex.findall(url)
    semester = "h" if "Höst" in url else "v" 
    return f"{code[:5]}{year[-1][-2:]}{semester}"

def download_program(url: str) -> None:
    """ Downloads the program data """
    code = get_program_code(url)
    data = requests.get(url)
    df = pd.read_excel(BytesIO(data.content))

    df = df.rename(columns={
        "Kurskod": "code",
        "Kurs": "name",
        "Poäng": "points",
        "Termin": "semester",
        "Startvecka": "start_week",
        "Slutvecka": "end_week",
        "Läsperiod": "period",
        "Typ": "type",
        "Inriktning": "focus",
        "Förkunskapskrav": "prerequisites",
        "Kursansvarig": "teacher",
        "Länk till kursansvarig": "teacher_url",
        "Ersättande kurs": "replacement",
        "Nästa kurstillfalle": "next_instance",
        "Länk till kursplan": "syllabus_url",
        "Länk till utbildningsplan": "education_plan_url",
    })
    
    df["points"] = df["points"].str.extract(r"(\d+\.?\d*)").astype(float)

    teacher_codes.update(df["teacher"].unique())
    
    file_path = os.path.join(DATA_PATH, f"{code}.json")
    df.to_json(file_path, index=False, orient="records", indent=4)
    print(f"Downloaded data for '{code}'")


def download_teacher(code: str) -> None:
    """ Fetches information about a teacher """
    search_url = teacher_url % code
    html = asyncio.run(fetch(search_url))
    soup = BeautifulSoup(html, "html.parser")

    result = soup.find(attrs={"class": "Search-result"})
    ul = result.find("div", attrs={"class": "SearchItem-text"})

    if ul is None:
        print(f"Could not find data for '{code}'")
        return

    ul = ul.find_all("li")

    name = " ".join(reversed(result.find("h3").text.strip().split(", ")))
    email = ""
    room = ""
    phone = ""
    unit = ""
    location = ""

    for li in ul:
        text = li.text.strip().lower()
        if "e-post" in text:
            email = text.split(": ")[1]
        elif "rum" in text:
            room = text.split(": ")[1]
        elif "telefon" in text:
            phone = text.split(": ")[1]
        elif "enhet" in text:
            unit = text.split(": ")[1]
        elif "jänsteställe" in text:
            location = text.split(": ")[1]

    with process_lock:
        with open(TEACHER_CSV, "a", encoding="utf-8") as f:
            f.write(f"{code};{name};{email};{phone};{room};{unit};{location}\n")

    print(f"Downloaded data for '{code}'")


async def main() -> int:
    """ Main function """
    should_update = args.get("update")

    # Check if the data exists
    if os.path.exists(DATA_PATH) and not should_update:
        print("Data already exists. Use the -u flag to update.")
        return 0
    
    # Get a list of urls
    html = await fetch(program_url)
    soup = BeautifulSoup(html, "html.parser")
    urls = [program_url + re.sub(r"^\.\/", "", a["href"]) for a in soup.find_all("a", href=excel_regex)]

    # Download program data
    with ThreadPoolExecutor() as executor:
        await asyncio.gather(*[asyncio.to_thread(executor.submit, download_program, url) for url in urls])

    # Download teacher data
    with open(TEACHER_CSV, "w", encoding="utf-8") as f:
        f.write("code;name;email;phone;room;unit;location\n")

    with ProcessPoolExecutor() as executor:
        await asyncio.gather(*[asyncio.to_thread(executor.submit, download_teacher, code) for code in teacher_codes])

    with open(TEACHER_CSV, "r", encoding="utf-8") as f:
        df = pd.read_csv(f, delimiter=";")
        df.to_json(TEACHER_JSON, orient="records", indent=4)

    os.remove(TEACHER_CSV)

    # Generate index
    indexes = defaultdict(list)
    for file in os.listdir(DATA_PATH):
        if program_regex.match(file):
            code = file[:5].upper()
            semester = file.split(".")[0][5:].lower()
            indexes[code].append(semester)

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(indexes, f, indent=4)

    # Get names
    names = {}

    for h2 in soup.find_all("h2"):
        match = re.match(r"(\w{5}) - (.+)", h2.text)
        if match:
            code, name = match.groups()
            names[code] = name

    with open(NAMES_PATH, "w", encoding="utf-8") as f:
        json.dump(names, f, indent=4)

    return 0

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))