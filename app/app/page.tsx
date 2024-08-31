
import { cookies } from "next/headers";
import DataProvider from "@/contexts/DataProvider";
import App from "./App";
import readFile from "@/utils/readFile";
import { codeRegex, semesterRegex } from "@/utils/splitProgram";

export default async function Home() {
  // Read list of programs
  const index = await readFile("index");
  const names = await readFile("names");
  const programs = Array.from(new Set(Object.keys(index)).intersection(new Set(Object.keys(names))));

  // Read cookies
  const cookieJar = cookies();
  let selectedCode = cookieJar.get("selectedCode")?.value || "";
  let selectedSemester = cookieJar.get("selectedSemester")?.value || "";

  // Set program code
  if(!codeRegex.test(selectedCode) || !names.includes(selectedCode)){
    selectedCode = programs[0];
  };

  // Set program semester
  if(!semesterRegex.test(selectedSemester) || !index[selectedCode].includes(selectedSemester)){
    selectedSemester = index[selectedCode].sort()[0];
  }

  return (
    <DataProvider names={names} data={index} initialProgram={{
      name: names[selectedCode],
      code: selectedCode,
      semester: selectedSemester
    }}>
      <App/>
    </DataProvider>
  );
}
