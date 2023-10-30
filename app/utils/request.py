from flask import request

def get_theme() -> str:
  saved_theme = request.cookies.get("theme")
  if isinstance(saved_theme, str) and saved_theme.lower() in ["light", "dark"]:
    return saved_theme.lower()
  return "light"

def get_saved_program_code(default: str) -> str:
  saved_program_code = request.cookies.get("program_code")
  return saved_program_code if isinstance(saved_program_code, str) else default
