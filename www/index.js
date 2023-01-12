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

async function getIndex() {
  console.log("Getting index");
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

// Cleanup
window.onunload = () => {
  window.removeEventListener("resize", setHeight);
};
