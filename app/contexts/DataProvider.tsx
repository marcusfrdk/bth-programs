"use client";

import type { ReactNode } from "react";
import { createContext, useState, useContext } from "react";

export type DataContextType = {
    data: any;
    selectedProgram: string;
    updateSelectedProgram: (program: string) => void;
};

type DataProviderProps = {
    children: ReactNode;
    data: any;
    initialSelection: string;
};

export const DataContext = createContext<DataContextType>({
    data: {},
    selectedProgram: "DVAMI21h",
    updateSelectedProgram: () => {},
});

export function useData(){
    return useContext(DataContext);
}

export default function DataProvider({children, data, initialSelection}: DataProviderProps){
    const [selectedProgram, setSelectedProgram] = useState(initialSelection);
    
    function updateSelectedProgram(program: string){
        setSelectedProgram(program);
        document.cookie = `selectedProgram=${program}; SameSite=Strict; Path=/`;
    };

    return (
        <DataContext.Provider value={{
            data, 
            selectedProgram, 
            updateSelectedProgram
        }}>
            {children}
        </DataContext.Provider>
    );
}