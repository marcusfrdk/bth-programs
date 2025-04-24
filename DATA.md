# Data

This document covers the structure of the data the app requires. Note that _all translations are currently in swedish_ with a multi-language application being a future goal.

## `<program>.json`

### Description

All programs at Blekinge Institute of Technology have a unique ID (e.g. `DVAMI21h`, `DVAAM24h`, etc.). This ID is used for the file name of each program's JSON file. This file contains the courses for that specific program. All data files are located in the [app/data](./app/data) directory.

### Structure

Each program's data file is an object containing course objects.

```jsonc
{
    "<COURSE_1>: {
        "code": <CODE>, // The course code (e.g. `DV1574`, `MA1486`, etc.)
        "name": <string>,
        "points": <float>, // The number of credits
        "semester": <Hösttermin|Vårtermin YEAR>,
        "start_week": <int>,
        "end_week": <int>,
        "periods": [
            <int>,
            ...
        ], // The periods the course is given in (1-4)
        "type": <Obligatorisk|Valbar>,
        "academic_focus": <string>,
        "prerequisites": <string>,
        "teacher": <TEACHER ID>,
        "replacement": <string>,
        "next_instance": <string>,
        "syllabus_url": <URL>,
        "education_plan_url": <URL>,
        "start_year": <int>,
        "end_year": <int>,
        "course_duration": <int>, // In weeks
        "is_double": <bool>,
        "color": <HEX COLOR>, // Used for the left border in the app
    },
    "<COURSE_2>": ...,
    ...
}
```

## `index.json`

### Description

The [index.json](./app/data/index.json) file, is a JSON file that contains the programs and their respective years. It is used to index the data files in the [data](./app/data) directory and is generated once all the programs have been downloaded.

### Structure

```json
{
    "<CODE>": [
        "<YEAR>",
        "<YEAR>",
        "<YEAR>",
        ...
    ],
    ...
}
```

where `<CODE>` is the program code (e.g. `DVAMI`, `DVAAM`, etc.) and the year is the year or the program (e.g. `21h`, `21v`, etc.).

## `names.json`

### Description

The [names.json](./app/data/names.json) file is a JSON file that contains the name of the program as a key-value pair. With the key being the program code and the value being the name of the program. It is used to display the name of the program in the app.

### Structure

```json
{
    "<CODE>": "<NAME>",
    ...
}
```

where `<CODE>` is the program code (e.g. `DVAMI`, `DVAAM`, etc.) and `<NAME>` is the name of the program (e.g. `Civilingenjör i AI och maskininlärning`, `Civilingenjör i datorsäkerhet`, etc.).

## `teachers.json`

### Description

The file [teachers.json](./app/data/teachers.json) is a JSON file that contains the teachers and their respective public information, such as name, email and phone number. It is used to display the teacher's information in the app.

### Structure

```json
{
    "<CODE>":{
        "code": <CODE>,
        "name": <string>,
        "email": <string>,
        "phone": <string>,
        "room": <string>,
        "unit": <string>,
        "location": <string>,
    },
    ...
}
```

where `<CODE>` is the teacher's ID at Blekinge Institute of Technology. The `unit` is what unit that teacher belongs to (e.g. `institutionen för datavetenskap`, `institutionen för industriell ekonomi`, etc.). **All fields except `name` are lower case and encoded in UTF-8.**

## `years.json`

### Description

The file [years.json](./app/data/years.json) is a JSON file that contains the number of years a specific program (code + year) has. This is used in the app to display the number of years a program has.

### Structure

```json
{
    "<CODE+YEAR>": <int>,
    ...
}
```

where `<CODE+YEAR>` is the full program ID (e.g. `DVAMI21h`, `DVAAM24h`, etc.). The value is the length of that program. As for most civilengineering programs, they are 5 years.
