"use client";

import splitProgram from "@/utils/splitProgram";
import type { ReactNode } from "react";
import { createContext, useState, useContext } from "react";

type SelectedProgramType = {
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
    selectedProgram: SelectedProgramType;
    updateSelectedProgram: (program: string) => void;
};

type DataProviderProps = {
    children: ReactNode;
    names: Record<string, string>;
    data: Record<string, string[]>;
    initialProgram: SelectedProgramType;
};

export const DataContext = createContext<DataContextType>({
    names: {},
    data: {},
    selectedProgram: defaultProgram,
    updateSelectedProgram: () => {},
});

export function useData(){
    return useContext(DataContext);
}

export default function DataProvider({
    children,
    names,
    data,
    initialProgram
}: DataProviderProps){
    const [selectedProgram, setSelectedProgram] = useState<SelectedProgramType>(initialProgram);
    
    function updateSelectedProgram(program: string){
        const {code, semester} = splitProgram(program);

        if(!names[code] || Object.keys(names).includes(code)){
            return;
        }

        const data: SelectedProgramType = {
            name: names[code],
            code,
            semester
        };

        setSelectedProgram(data);
        document.cookie = `selectedProgram=${program}; SameSite=Strict; Path=/`;
    };

    return (
        <DataContext.Provider value={{
            names,
            data,
            selectedProgram,
            updateSelectedProgram
        }}>
            {children}

            <p>{JSON.stringify(selectedProgram)}</p>
        </DataContext.Provider>
    );
}