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

async function fetchIndex(){
  const url = `https://raw.githubusercontent.com/marcusfrdk/bth-programs/${activeBranch}/data/index.json#${Date.now()}`;
  const response = await fetch(url);
  if(response.status === 200) return await response.json();
  else [];
}

async function getIndex() {
  const cache = localStorage.getItem("index");
  


}

async function loadData(course) {
  console.log("Loading", course);
}

function setAvailablePrograms(index){
  const doc = document.getElementById("program-selector");
  Object.keys(index).forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.text = code.toUpperCase();
    doc.appendChild(option);
  });




}

function setLoading(state) {
  // const docs = document.getElementsByClassName("loading");
  // console.log(docs);

}

async function main(){
  const index = await getIndex();
  if(index){
    setAvailablePrograms(index);
  }
  setLoading(false);
}

// Main
window.addEventListener("resize", setHeight);

main();

// Cleanup
window.onunload = () => {
  window.removeEventListener("resize", setHeight);
};
