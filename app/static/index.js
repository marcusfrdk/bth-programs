function setTheme(theme) {
  console.log(`Setting theme to ${theme}`);
  fetch("/api/theme", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ theme: theme })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to set theme.");
    }
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  })
  .catch(error => {
    console.error(error);
  });
}