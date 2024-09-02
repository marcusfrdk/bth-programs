"use client";

import type {ChangeEvent} from "react";
import type { IconType } from "react-icons";
import styled from "@emotion/styled";
import { useData } from "@/contexts/DataProvider";
import { useMemo, useState } from "react";
import {FaChevronDown as ChevronDown} from "react-icons/fa6"; 

type Props = {
    onSelect: (program: string) => void;
    Icon?: IconType;
    placeholder?: string;
    text?: string;
    disabledCompared?: boolean;
};

export default function SelectProgram({
    onSelect,
    Icon = ChevronDown,
    placeholder = "Välj program",
    text,
    disabledCompared = false
}: Props){
    const {selectedProgram, comparedPrograms, programs} = useData();
    const [value, setValue] = useState<string>(selectedProgram ? selectedProgram?.code + selectedProgram?.semester : "");

    function handleChange(e: ChangeEvent<HTMLSelectElement>){
        const newValue = e.target.value;
        onSelect(newValue);
        setValue(newValue);
    }

    const currentProgram = useMemo(() => {
        return selectedProgram ? selectedProgram.code + selectedProgram.semester : ""; 
    }, [selectedProgram]);

    const disabledSelections = useMemo(() => {
        const disabled = disabledCompared ? [...comparedPrograms.map(program => program.code + program.semester)] : [];
        return [currentProgram, ...disabled];
    }, [currentProgram, comparedPrograms, disabledCompared]);

    return (
        <Container>
            <p>{text || value || placeholder || ""}</p>
            <div>
                <Icon fill="var(--weak)" /> 
            </div>

            <select value={value} onChange={handleChange}>
                {Object.entries(programs).sort().map(([code, semesters]) => {
                    return (
                        <optgroup key={code} label={code}>
                            {semesters.sort().map(semester => {
                                const isDisabled = disabledSelections.includes(code + semester);
                                return (
                                    <option key={semester} value={code + semester} disabled={isDisabled}>
                                        {semester}
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

    & > p {
        font-size: 1rem;
    }

    & > div {
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
    }

    @media screen and (hover: hover){
        &:hover {
            background-color: var(--neutral-3);
        }
    }
`;