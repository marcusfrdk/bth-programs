"use client";

export default function SelectProgramButton({program}: {program: string}) {
    function setProgram(){
        console.log("Setting program to " + program);
        document.cookie = "selectedProgram=" + program;
    }
    
    return (
        <button onClick={setProgram}>
            Set program to {program}
        </button>
    )
}