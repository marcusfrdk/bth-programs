<p align=center><img src="./assets/bth-logo.png" /></p>

# Blekinge Institute of Technology - Programs and Courses

Get an overview of your programs and courses at Blekinge Institute of Technology.

You can [view the application here](https://bth.marcusfredriksson.com).

## Requirements

- Python 3.6 or greater

## Installation

To get setup with your own environment for development, run the following commands:

```bash
git clone https://github.com/marcusfrdk/bth-programs
cd bth-courses
pip3 install -r requirements.txt
```

_`pip` instead of `pip3` if on Windows_

## Notes

- Generated data files can be found in `data/*.json`
- The program utilizes multithreading and will by default utilize all available CPU cores, to set a custom amount of threads, use the `--threads` flag.

### All

To generate all program data files, run the following command:

```bash
python3 run_all.py
```

### Single/Multiple

To get a single/multiple program data file(s), run the following command:

```bash
python3 run.py CODE [CODE...]
```

## Todo

- [ ] Add support for courses spanning over multiple semesters
- [ ] Add ability to select courses and add to custom schedule
