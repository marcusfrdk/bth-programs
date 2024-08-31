
import { cookies } from "next/headers";
import DataProvider from "@/contexts/DataProvider";
import App from "./App";
import readFile from "@/utils/readFile";
import splitProgram, { codeRegex, semesterRegex } from "@/utils/splitProgram";

export default async function Home() {
  // Read list of programs
  const index = await readFile("index");
  const names = await readFile("names");
  const programs = Array.from(new Set(Object.keys(index)).intersection(new Set(Object.keys(names)))); 

  // Read cookies
  const cookieJar = cookies();
  const selectedCodeCookie = cookieJar.get("selectedCode")?.value || "";
  const selectedSemesterCookie = cookieJar.get("selectedSemester")?.value || "";
  const comparedProgramsCookie = cookieJar.get("comparedPrograms")?.value || "";
  let hasSelectedProgram = selectedCodeCookie !== "" && selectedSemesterCookie !== "";

  let selectedCode = selectedCodeCookie;
  let selectedSemester = selectedSemesterCookie;
  let comparedPrograms = [];

  if(hasSelectedProgram){
    // Set program code
    if(!codeRegex.test(selectedCodeCookie) || !Object.keys(names).includes(selectedCodeCookie)){
      // selectedCode = programs[0];
      hasSelectedProgram = false;
    };
    
    // Set program semester
    if(
      !semesterRegex.test(selectedSemesterCookie) || 
      !index[selectedCode].includes(selectedSemesterCookie)
    ){
      hasSelectedProgram = false;
      // selectedSemester = index[selectedCode].sort()[0];
    };
  }


  // Get programs to compare with selected
  comparedPrograms = comparedProgramsCookie.split(",").filter(program => {
    const { code, semester } = splitProgram(program);
    return codeRegex.test(code) && semesterRegex.test(semester) && programs.includes(code) && index[code].includes(semester);
  }).map((program) => {
    const { code, semester } = splitProgram(program);
    return { name: names[code], code, semester };
  });

  return (
    <DataProvider 
      names={names} 
      data={index} 
      initialComparedPrograms={comparedPrograms}
      initialSelectedProgram={hasSelectedProgram ? {
        name: names[selectedCode],
        code: selectedCode,
        semester: selectedSemester
      } : null}
    >
      <App/>
    </DataProvider>
  );
}
