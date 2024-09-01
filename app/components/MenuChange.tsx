"use client";

import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import {FaChevronDown as ChevronDown} from "react-icons/fa6"; 

export default function MenuChange(){
    const { selectedProgram, updateSelectedProgram, programs } = useData();
    
    return (
        <Container>
            <h2>Ändra Program</h2>

            <Select>
                <p>{selectedProgram !== null ? selectedProgram.code + selectedProgram.semester : "Select program"}</p>
                <div>
                    <ChevronDown fill="var(--weak)" />
                </div>
                <select onChange={(e) => updateSelectedProgram(e.target.value)}>
                    {Object.entries(programs).sort().map(([code, semesters]) => {
                        return (
                            <optgroup key={code} label={code}>
                                {semesters.sort().map(semester => {
                                    const isDisabled = selectedProgram !== null && selectedProgram.code === code && selectedProgram.semester === semester;
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
            </Select>

        </Container>
    );
}

const Select = styled.div`
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

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
`;