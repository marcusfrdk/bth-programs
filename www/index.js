// Utils
function setHeight() {
  if (typeof window !== "undefined") {
    document.documentElement.style.setProperty(
      "--viewport-height",
      `${window.innerHeight}px`
    );
  }
}

// Data
const activeBranch = "refactor";

async function getIndex() {
  const url = `https://raw.githubusercontent.com/marcusfrdk/bth-programs/${activeBranch}/data/index.json#${Date.now()}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}

async function loadData() {
  const data = require("../data/DVAMI21h.json");
  console.log(data);
}

function setLoading(state) {
  const docs = document.getElementsByClassName("loading");
  console.log(docs);
}

// Main
window.addEventListener("resize", setHeight);

getIndex();

// Cleanup
window.onunload = () => {
  window.removeEventListener("resize", setHeight);
};
