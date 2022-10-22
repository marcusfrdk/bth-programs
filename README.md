<p align=center><img src="./assets/bth-logo.png" /></p>

# Blekinge Institute of Technology - Programs and Courses

Get an overview of your programs and courses at Blekinge Institute of Technology.

## Requirements

- Python 3.6 or greater

## Installation

To get setup with your own environment for development, run the following commands:

```bash
git clone https://github.com/marcusfrdk/bth-courses
cd bth-courses
pip3 install -r requirements.txt
```

_`pip` instead of `pip3` if on Windows_

## Usage

The generated data files can be found in `www/data/*.json`

### All

To generate all program data files, run the following command:

```bash
python3 run_all.py
```

### Single/Multiple

To get a single/multiple program data file(s), run the following command:

```bash
python3 main.py CODE [CODE...]
```
