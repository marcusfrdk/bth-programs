"use client";

import splitProgram from "@/utils/splitProgram";
import type { ReactNode } from "react";
import { createContext, useState, useContext } from "react";

type ProgramType = {
    name: string;
    code: string;
    semester: string;
};

const defaultProgram = {
    name: "Civilingenjör i AI och Maskininlärning",
    code: "DVAMI",
    semester: "21h",
};

type DataContextType = {
    names: Readonly<Record<string, string>>;
    data: Readonly<Record<string, string[]>>;
    selectedProgram: ProgramType;
    comparedPrograms: ProgramType[];
    updateSelectedProgram: (program: string) => void;
    addComparison: (program: string) => void,
    removeComparison: (program: string) => void
};

type DataProviderProps = {
    children: ReactNode;
    names: Record<string, string>;
    data: Record<string, string[]>;
    initialSelectedProgram: ProgramType;
    initialComparedPrograms: ProgramType[];
};

export const DataContext = createContext<DataContextType>({
    names: {},
    data: {},
    comparedPrograms: [],
    selectedProgram: defaultProgram,
    updateSelectedProgram: () => {},
    addComparison: () => {},
    removeComparison: () => {}
});

export function useData(){
    return useContext(DataContext);
}

export default function DataProvider({
    children,
    names,
    data,
    initialSelectedProgram,
    initialComparedPrograms
}: DataProviderProps){
    const [selectedProgram, setSelectedProgram] = useState<ProgramType>(initialSelectedProgram);
    const [comparedPrograms, setComparedPrograms] = useState<ProgramType[]>(initialComparedPrograms);

    function updateSelectedProgram(program: string){
        const {code, semester} = splitProgram(program);

        if(!names[code] || Object.keys(names).includes(code)){
            return;
        }

        const data: ProgramType = {
            name: names[code],
            code,
            semester
        };

        setSelectedProgram(data);
        document.cookie = `selectedProgram=${program}; SameSite=Strict; Path=/`;
    };

    function addComparison(program: string){
        const cookieValue = document.cookie.split(";").find(cookie => cookie.startsWith("comparedPrograms="))?.split("=")[1] || "";
        const programs = cookieValue.split(",").filter(program => program !== "");
        
        const {code, semester} = splitProgram(program);

        if(
            !Object.keys(data).includes(code) || 
            !data[code].includes(semester) ||
            programs.includes(program)
        ) return;

        // Update cookie
        programs.push(program);
        document.cookie = `comparedPrograms=${programs.join(",")}; SameSite=Strict; Path=/`;

        // Update state
        setComparedPrograms(programs => {
            const {code, semester} = splitProgram(program);

            if(!names[code] || !data[code].includes(semester)){
                return programs;
            }

            return [
                ...programs,
                {
                    name: names[code],
                    code,
                    semester
                }
            ];
        });
    };

    function removeComparison(program: string){
        const cookieValue = document.cookie.split(";").find(cookie => cookie.startsWith("comparedPrograms="))?.split("=")[1] || "";
        let programs = cookieValue.split(",").filter(program => program !== "");

        // Update cookie
        programs = programs.filter(p => p !== program);
        document.cookie = `comparedPrograms=${programs.join(",")}; SameSite=Strict; Path=/`;

        // Update state
        setComparedPrograms(programs.map(program => {
            const {code, semester} = splitProgram(program);

            if(!names[code] || !data[code].includes(semester)){
                return null;
            }

            return {
                name: names[code],
                code,
                semester
            };
        }) as ProgramType[]);
    }

    return (
        <DataContext.Provider value={{
            names,
            data,
            selectedProgram,
            comparedPrograms,
            updateSelectedProgram,
            addComparison,
            removeComparison
        }}>
            {children}
        </DataContext.Provider>
    );
}