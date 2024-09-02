"use client";

import type { ReactNode } from "react";
import type { TeachersType } from "@/types/Program";
import setCookie from "@/utils/setCookie";
import splitProgram from "@/utils/splitProgram";
import { createContext, useState, useContext, useCallback } from "react";

type DataContextType = {
    names: Readonly<Record<string, string>>;
    programs: Readonly<Record<string, string[]>>;
    teachers: Readonly<TeachersType>;
    selectedProgram: Readonly<string>;
    comparedPrograms: Readonly<string[]>;
    updateSelectedProgram: (program: string) => void;
    addComparison: (program: string) => void,
    removeComparison: (program: string) => void
};

type DataProviderProps = {
    children: ReactNode;
    names: Record<string, string>;
    programs: Record<string, string[]>;
    teachers: TeachersType;
    initialSelectedProgram: string;
    initialComparedPrograms: string[];
};

export const DataContext = createContext<DataContextType>({
    names: {},
    programs: {},
    teachers: {},
    comparedPrograms: [],
    selectedProgram: "",
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
    const [selectedProgram, setSelectedProgram] = useState<string>(initialSelectedProgram);
    const [comparedPrograms, setComparedPrograms] = useState<string[]>(initialComparedPrograms);

    const updateSelectedProgram = useCallback((program: string) => {
        const {code, semester} = splitProgram(program);

        if(!Object.keys(names).includes(code)){
            return;
        }

        setSelectedProgram(program);
        setComparedPrograms(programs => programs.filter(f => f !== program));
        setCookie("selectedCode", code);
        setCookie("selectedSemester", semester);
        removeComparison(program);
    }, [names, programs, removeComparison]);

    const addComparison = useCallback((program: string) => {
        const programs = [...comparedPrograms, program];
        setCookie("comparedPrograms", programs.join(","));
        setComparedPrograms(programs);
    }, [comparedPrograms, names]);

    function removeComparison(program: string){
        const programs = comparedPrograms.filter(cp => cp != program);
        setCookie("comparedPrograms", programs.join(","));
        setComparedPrograms(programs);
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