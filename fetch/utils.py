def get_times(p: str) -> tuple:
  """ Extracts the year and week number from the time interval format of the site """ 
  start, end = "", ""
  for i, time in enumerate(p.split("until" if "until" in p else "till")):
    year, week = time.strip().split(" ")[0:3:2]
    week = "0" + week if len(week) == 1 else week

    if i == 0:
      start = year + week
    else:
      end = year + week

  return start, end
