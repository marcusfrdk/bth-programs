"use client";

import type {ChangeEvent, CSSProperties} from "react";
import type { IconType } from "react-icons";
import styled from "@emotion/styled";
import { useData } from "@/contexts/DataProvider";
import { useMemo, useState } from "react";
import {FaChevronDown as ChevronDown} from "react-icons/fa6"; 

type Props = {
    onSelect: (program: string) => void;
    Icon?: IconType | null;
    initialText?: string;
    permanentText?: string;
    disable?: "current" | "compared" | "both" | "none";
    style?: CSSProperties;
};

export default function SelectProgram({
    onSelect,
    Icon = ChevronDown,
    permanentText,
    disable = "current",
    style
}: Props){
    const {selectedProgram, comparedPrograms, programs, years} = useData();
    const [value, setValue] = useState<string>(selectedProgram);

    function handleChange(e: ChangeEvent<HTMLSelectElement>){
        const newValue = e.target.value;
        onSelect(newValue);
        setValue(newValue);
    }

    const disabledPrograms = useMemo(() => {
        if(disable === "none") return [];
        if(disable === "both") return [selectedProgram, ...comparedPrograms];
        if(disable === "compared") return comparedPrograms;
        if(disable === "current") return [selectedProgram];
        return [];
    }, [selectedProgram, comparedPrograms]);

    return (
        <Container style={style}>
            <p className="text">{permanentText || value || "Välj program"}</p>
            {Icon && <div className="icon">
                <Icon fill="var(--weak)" /> 
            </div>}

            <select value="default" onChange={handleChange}>
                <option disabled value="default">Välj bland {Object.keys(programs).length} program</option>
                {Object.entries(programs).sort().map(([code, semesters]) => {
                    return (
                        <optgroup key={code} label={code}>
                            {semesters.sort().map(semester => {
                                const program = code + semester;
                                const isDisabled = disabledPrograms.includes(program);
                                const nYears = Object.keys(years).includes(program) ? years[program] : null;

                                return (
                                    <option key={semester} value={code + semester} disabled={isDisabled}>
                                        {semester}{nYears ? ` (${nYears} år)` : ""}
                                    </option>
                                );
                            })}
                        </optgroup>
                    );
                })}
            </select>
        </Container>
    )
};

const Container = styled.div`
    padding: 0.25rem 0.75rem;
    background-color: var(--neutral-2);
    width: 100%;
    max-width: 32rem;
    border: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 0.25rem;
    position: relative;
    cursor: pointer;

    & > *:not(select){
        pointer-events: none;
    }

    & > p.text {
        font-size: 1rem;
        line-height: 2.5rem;
    }

    & > div.icon {
        height: 2.5rem;
        width: 2.5rem;
        min-height: 2.5rem;
        min-width: 2.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    & > select {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        opacity: 0;
        cursor: pointer;
        background-color: var(--neutral-1);
        color: var(--strong);
    }

    @media screen and (hover: hover){
        &:hover {
            background-color: var(--neutral-3);
        }
    }
`;