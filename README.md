<p align=center><img src="./assets/bth-logo.png" width="256" /></p>

# Blekinge Institute of Technology - Programs and Courses

Get an overview of your programs and courses at Blekinge Institute of Technology.

You can [view the application here](https://bth.marcusfredriksson.com).

## Disclaimer

This project is _not affiliated_ with Blekinge Institute of Technology in any way.

## Usage

_Note: Generated data files can be found in `data/*.json`_

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

## Command Line Arguments

| Argument    | Description                                   | Type         |
| ----------- | --------------------------------------------- | ------------ |
| `code`      | one or multiple program codes to download     | str or \*str |
| `--help`    | Show help message and exit                    |              |
| `--threads` | limits the program to a set number of threads |              |

## Contributing

If you want to contribute to this project, please read the [contributing guidelines](./CONTRIBUTING.md).
