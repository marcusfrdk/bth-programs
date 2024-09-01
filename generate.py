import argparse
import asyncio
import os
import sys
import re
import requests
import json
import hashlib
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
    try:
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
            "Läsperiod": "periods",
            "Typ": "type",
            "Inriktning": "academic_focus",
            "Förkunskapskrav": "prerequisites",
            "Kursansvarig": "teacher",
            "Länk till kursansvarig": "teacher_url",
            "Ersättande kurs": "replacement",
            "Nästa kurstillfalle": "next_instance",
            "Länk till kursplan": "syllabus_url",
            "Länk till utbildningsplan": "education_plan_url",
        })

        df["code"] = df["code"].str.upper()        
        df["points"] = df["points"].str.extract(r"(\d+\.?\d*)").astype(float)

        # Reformat times
        df["start_week"] = df["start_week"].astype(str)
        df["end_week"] = df["end_week"].astype(str)

        df[["start_year", "start_week"]] = df["start_week"].str.extract(r"(\d{4})(\d{2})")
        df[["end_year", "end_week"]] = df["end_week"].str.extract(r"(\d{4})(\d{2})")
        df[["start_year", "start_week", "end_year", "end_week"]] = df[["start_year", "start_week", "end_year", "end_week"]].astype(int)

        df["course_duration"] = (df["end_year"] - df["start_year"]) * 52 + (df["end_week"] - df["start_week"]) + 1
        df["is_double"] = df["course_duration"] > 15

        def fix_period(row):
            is_double = row["is_double"]

            if row["start_week"] < 10:
                return [3, 4] if is_double else [3] 
            elif row["start_week"] < 30:
                return [4, 1] if is_double else [4]
            elif row["start_week"] < 40:
                return [1, 2] if is_double else [1]
            else:
                return [2, 3] if is_double else [2]

        df["periods"] = df.apply(fix_period, axis=1)

        # Color
        def generate_color(course_code: str):
            return f"#{hashlib.sha256(course_code[:2].encode()).hexdigest()[:6]}"

        df["color"] = df["code"].apply(generate_color)

        teacher_codes.update(df["teacher"].unique())

        # Remove
        df = df.drop_duplicates(subset=["code"], keep="first")
        df = df.drop(columns=["teacher_url"])

        groups = {}
        for _, row in df.iterrows():
            year = str(row["start_year"])
            
            if year not in groups:
                groups[year] = {}
            
            for period in row["periods"]:
                if period not in groups[year]:
                    groups[year][period] = []
                
                groups[year][period].append(row["code"])

        def replace_nan_with_none(obj):
            if isinstance(obj, dict):
                return {k: replace_nan_with_none(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [replace_nan_with_none(elem) for elem in obj]
            elif isinstance(obj, float) and np.isnan(obj):
                return None
            return obj

        data = df.set_index("code").to_dict(orient="index")
        data = replace_nan_with_none(data)
        data["_groups"] = replace_nan_with_none(groups)

        file_path = os.path.join(DATA_PATH, f"{code}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, allow_nan=False)

        print(f"Downloaded data for '{code}'")
    except Exception as e:
        print(f"Error downloading data for '{code}': {e}")

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
    
    os.makedirs(DATA_PATH, exist_ok=True)
    
    # Get a list of urls
    html = await fetch(program_url)
    soup = BeautifulSoup(html, "html.parser")
    urls = [program_url + re.sub(r"^\.\/", "", a["href"]) for a in soup.find_all("a", href=excel_regex)]

    # Download program data
    with ThreadPoolExecutor() as executor:
        await asyncio.gather(*[asyncio.to_thread(executor.submit, download_program, url) for url in urls])

    # # Download teacher data
    # with open(TEACHER_CSV, "w", encoding="utf-8") as f:
    #     f.write("code;name;email;phone;room;unit;location\n")

    # with ProcessPoolExecutor() as executor:
    #     await asyncio.gather(*[asyncio.to_thread(executor.submit, download_teacher, code) for code in teacher_codes])

    # with open(TEACHER_CSV, "r", encoding="utf-8") as f:
    #     df = pd.read_csv(f, delimiter=";")
    #     df.loc[df["name"] == "Nan Huang", "code"] = "nan" # Fun edge case, since the code is "nan", pandas believes it's NaN
    #     df.to_json(TEACHER_JSON, orient="records", indent=4)

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
    exit_code = asyncio.run(main())
    os.remove(TEACHER_CSV) if os.path.exists(TEACHER_CSV) else None
    sys.exit(exit_code)