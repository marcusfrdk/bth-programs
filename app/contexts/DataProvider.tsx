"use client";

import type { ReactNode } from "react";
import setCookie from "@/utils/setCookie";
import splitProgram from "@/utils/splitProgram";
import { TeachersType } from "@/types/Program";
import { createContext, useState, useContext, useCallback } from "react";

type ProgramType = {
    name: string;
    code: string;
    semester: string;
};

type DataContextType = {
    names: Readonly<Record<string, string>>;
    programs: Readonly<Record<string, string[]>>;
    teachers: Readonly<TeachersType>;
    selectedProgram: ProgramType | null;
    comparedPrograms: ProgramType[];
    updateSelectedProgram: (program: string) => void;
    addComparison: (program: string) => void,
    removeComparison: (program: string) => void
};

type DataProviderProps = {
    children: ReactNode;
    names: Record<string, string>;
    programs: Record<string, string[]>;
    teachers: TeachersType;
    initialSelectedProgram: ProgramType | null;
    initialComparedPrograms: ProgramType[];
};

export const DataContext = createContext<DataContextType>({
    names: {},
    programs: {},
    teachers: {},
    comparedPrograms: [],
    selectedProgram: null,
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
    programs,
    teachers,
    initialSelectedProgram,
    initialComparedPrograms
}: DataProviderProps){
    const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(initialSelectedProgram);
    const [comparedPrograms, setComparedPrograms] = useState<ProgramType[]>(initialComparedPrograms);

    function updateSelectedProgram(program: string){
        const {code, semester} = splitProgram(program);

        if(!Object.keys(names).includes(code)){
            return;
        }

        const data: ProgramType = {
            name: names[code],
            code,
            semester
        };

        setSelectedProgram(data);
        setComparedPrograms(programs => programs.filter(f => f.code !== data.code && f.semester !== data.semester));
        setCookie("selectedCode", code);
        setCookie("selectedSemester", semester);
    };

    const addComparison = useCallback((program: string) => {
        const programs = [...comparedPrograms.map(cp => cp.code + cp.semester), program];
        setCookie("comparedPrograms", programs.join(","));
        setComparedPrograms(programs.map(program => {
            const {code, semester} = splitProgram(program);
            return {
                name: names[code],
                code,
                semester
            }
        }));
    }, [comparedPrograms, names]);

    function removeComparison(program: string){
        const programs = comparedPrograms.filter(cp => cp.code + cp.semester !== program).map(cp => cp.code + cp.semester);
        setCookie("comparedPrograms", programs.join(","));
        setComparedPrograms(programs.map(program => {
            const {code, semester} = splitProgram(program);
            return {
                name: names[code],
                code,
                semester
            };
        }));
    }

    return (
        <DataContext.Provider value={{
            names,
            programs,
            teachers,
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