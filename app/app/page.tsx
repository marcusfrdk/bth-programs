import Image from "next/image";
import styles from "./page.module.css";

import {promises as fs} from "fs";
import { cookies } from "next/headers";
import SelectProgramButton from "@/components/SelectProgramButton";

export default async function Home() {
  // Read list of programs
  const indexBuffer = await fs.readFile(process.cwd() + "/public/data/index.json");
  const indexData = JSON.parse(indexBuffer.toString());

  // Get selected program from cookie
  const cookieJar = cookies();
  let selectedProgram = cookieJar.get("selectedProgram")?.value;

  if(!selectedProgram){
    const defaultCode = Object.keys(indexData).sort()[0];
    selectedProgram = defaultCode + indexData[defaultCode].sort()[0];
  }

  return (
    <main className={styles.main}>
      <SelectProgramButton program="DVAMI21h" />
      <SelectProgramButton program="XXXXX24h" />
    </main>
  );
}
