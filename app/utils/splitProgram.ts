export const programRegex = /^[A-Z]{5}\d{2}[vh]$/;
export const codeRegex = /^[A-Z]{5}$/;
export const semesterRegex = /^\d{2}[vh]$/;

export default function splitProgram(program: string){
    if(!programRegex.test(program)){
        return {
            code: "",
            semester: ""
        }
    }

    const code = program.substring(0, 5);
    const semester = program.substring(5, 8);
    
    return {code, semester};
};