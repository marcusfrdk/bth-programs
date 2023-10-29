import json

from fetch.program import get_program_codes, get_program

def main() -> int:
  semesters = get_program_codes()
  
  # for semester in semesters:
  #   get_program(semester)

  get_program("DVAMI21h")

  return 0

if __name__ == "__main__":
  exit(main())