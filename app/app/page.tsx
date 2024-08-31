import {promises as fs} from "fs";
import { cookies } from "next/headers";
import DataProvider from "@/contexts/DataProvider";
import App from "./App";

const codeRegex = /^[A-Z]{5}\d{2}[vh]$/;

export default async function Home() {
  // Read list of programs
  const indexBuffer = await fs.readFile(process.cwd() + "/public/data/index.json");
  const indexData = JSON.parse(indexBuffer.toString());
  const indexKeys = Object.keys(indexData).sort();

  const defaultCode = indexKeys[0];
  const defaultProgram = defaultCode + indexData[defaultCode].sort()[0];
  
  // Get selected program from cookie
  const cookieJar = cookies();
  let selectedProgram = cookieJar.get("selectedProgram")?.value as string;

  // Cookie exists
  if(selectedProgram){
    // Cookie is invalid
    if(!codeRegex.test(selectedProgram)){
      selectedProgram = defaultProgram;
    } 
    
    // Check if program exists
    else {
      const programCode = selectedProgram.substring(0, 5);
      const programSemester = selectedProgram.substring(5, 8);

      // Program does not exist
      if(!indexData[programCode] || !indexData[programCode].includes(programSemester)){
        selectedProgram = defaultProgram;
      };
    }
  }

  return (
    <DataProvider data={indexData} initialSelection={selectedProgram}>
      <App/>
    </DataProvider>
  );
}
