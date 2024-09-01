
import type { IndexType, NamesType, TeachersType } from "@/types/Program";
import { cookies } from "next/headers";
import DataProvider from "@/contexts/DataProvider";
import App from "./App";
import splitProgram, { codeRegex, semesterRegex } from "@/utils/splitProgram";
import QueryProvider from "@/contexts/QueryProvider";

import indexData from "@/data/index.json";
import namesData from "@/data/names.json";
import teachersData from "@/data/teachers.json";

export default function Home() {
  const index: IndexType = indexData;
  const names: NamesType = namesData;
  const teachers: TeachersType = teachersData;

  const indexKeys = new Set(Object.keys(index));
  const namesKeys = new Set(Object.keys(names));
  const programs = Array.from(indexKeys).filter(key => namesKeys.has(key));

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
      !Object.keys(index).includes(selectedCode) ||
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
      programs={index}
      teachers={teachers}
      initialComparedPrograms={comparedPrograms}
      initialSelectedProgram={hasSelectedProgram ? {
        name: names[selectedCode],
        code: selectedCode,
        semester: selectedSemester
      } : null}
    >
      <QueryProvider>
        <App/>
      </QueryProvider>
    </DataProvider>
  );
}
