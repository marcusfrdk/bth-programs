""" Generate program data from BTH's website """

import asyncio
import sys
import re
import requests
import pandas as pd
import os
import shutil
import json
import threading as th
import numpy as np
from collections import defaultdict
from bs4 import BeautifulSoup
from io import BytesIO
from pyppeteer import launch

# Config
THREAD_COUNT = os.cpu_count() or 1

# Regex
excel_regex = re.compile(r"\.xlsx$")
year_regex = re.compile(r"\d{4}")

# Paths
ROOT_PATH = os.path.abspath(os.path.dirname(__file__))
DATA_PATH = os.path.join(ROOT_PATH, "data")
INDEX_PATH = os.path.join(DATA_PATH, "index.json")

async def get_html(url: str) -> str:
    """ Asyncronously fetches the HTML content of a webpage """
    browser = await launch()
    page = await browser.newPage()
    await page.goto(url)
    html = await page.content()
    await browser.close()
    return html

def get_program_code(url: str) -> str:
    """ Parses the url to get the program code """
    code = url.replace(" ", "").split(".")[-2].split("-")[-1]
    year = year_regex.findall(url)
    semester = "h" if "Höst" in url else "v" 
    return f"{code[:5]}{year[-1][-2:]}{semester}"

def confirm(prompt: str) -> bool:
    """ Prompts the user for confirmation """
    response = input(f"{prompt} [y/n]: ")
    return response.lower() == "y"

def process_program(urls: list[str]):
    """ Processes a list of program urls """
    for url in urls:
        code = get_program_code(url)
        data = requests.get(url)
        df = pd.read_excel(BytesIO(data.content))
        file_path = os.path.join(DATA_PATH, f"{code}.json")
        df.to_json(file_path, index=False)
        print(f"Saved data for '{code}'")

def main() -> int:
    try:
        # Remove existing data
        prompt = "The program data already exists. Do you want to overwrite it?"
        if os.path.exists(DATA_PATH):
            if not confirm(prompt):
                print("Exiting...")
                return 0

            shutil.rmtree(DATA_PATH)
        
        os.makedirs(DATA_PATH)

        # Get all programs
        base_url = "https://resources.bth.se/ProgrammeOverviews/Sv/"
        html = asyncio.run(get_html(base_url))
        soup = BeautifulSoup(html, "html.parser")
        urls = [base_url + re.sub(r"^\.\/", "", a["href"]) for a in soup.find_all("a", href=excel_regex)]
        
        # Read excel files
        chunks = np.array_split(urls, THREAD_COUNT)
        threads = []

        for chunk in chunks:
            thread = th.Thread(target=process_program, args=(chunk,))
            thread.start()
            threads.append(thread)

        for thread in threads:
            thread.join()

        # Generate index
        indexes = defaultdict(list)
        for file in os.listdir(DATA_PATH):
            code = file[:5].upper()
            semester = file.split(".")[0][5:].lower()
            indexes[code].append(semester)

        with open(INDEX_PATH, "w") as f:
            json.dump(indexes, f, indent=4)

        return 0
    except Exception as e:
        print(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())