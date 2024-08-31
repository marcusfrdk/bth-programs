"use client";

import splitProgram from "@/utils/splitProgram";
import type { ReactNode } from "react";
import { createContext, useState, useContext, useCallback } from "react";

type ProgramType = {
    name: string;
    code: string;
    semester: string;
};

type DataContextType = {
    names: Readonly<Record<string, string>>;
    data: Readonly<Record<string, string[]>>;
    selectedProgram: ProgramType | null;
    comparedPrograms: ProgramType[];
    updateSelectedProgram: (program: string) => void;
    addComparison: (program: string) => void,
    removeComparison: (program: string) => void
};

type DataProviderProps = {
    children: ReactNode;
    names: Record<string, string>;
    data: Record<string, string[]>;
    initialSelectedProgram: ProgramType | null;
    initialComparedPrograms: ProgramType[];
};

export const DataContext = createContext<DataContextType>({
    names: {},
    data: {},
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
    data,
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
        document.cookie = `selectedCode=${code}; SameSite=Strict; Path=/`;
        document.cookie = `selectedSemester=${semester}; SameSite=Strict; Path=/`;
    };

    const addComparison = useCallback((program: string) => {
        const programs = [...comparedPrograms.map(cp => cp.code + cp.semester), program];
        document.cookie = `comparedPrograms=${programs.join(",")}; SameSite=Strict; Path=/`;
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
        document.cookie = `comparedPrograms=${programs.join(",")}; SameSite=Strict; Path=/`;
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