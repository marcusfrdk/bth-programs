"use client";

import { useData } from "@/contexts/DataProvider";

export default function SelectProgramButton({program}: {program: string}) {
    const {updateSelectedProgram} = useData();
    
    return (
        <button onClick={() => updateSelectedProgram(program)}>
            Set program to {program}
        </button>
    )
}