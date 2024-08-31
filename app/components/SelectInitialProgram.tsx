"use client";

import type {ChangeEvent} from "react";
import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import splitProgram from "@/utils/splitProgram";
import Logo from "@/public/bth-logo.svg";

export default function SelectInitialProgram(){
    const {programs, updateSelectedProgram} = useData();

    function handleSelection(e: ChangeEvent<HTMLSelectElement>){
        const {code, semester} = splitProgram(e.target.value);
        
        if(
            !e.target.value || 
            !code || 
            !semester ||
            !Object.keys(programs).includes(code) ||
            !programs[code].includes(semester)
        ) return;

        updateSelectedProgram(code + semester);
        document.cookie = `selectedCode=${code}; SameSite=Strict; Path=/`;
    }
    
    return (
        <Container>
            <div>
                <Logo/>
                <div>
                    <h1>BTH Programs</h1>
                    <p>Get an overview of your program&apos;s schedule.</p>
                </div>
            </div>
            <Select>
                <p>Select your program</p>
                <select defaultValue="default" onChange={handleSelection}>
                    <option disabled value="default">Select from {Object.keys(programs).length} programs</option>
                    {Object.entries(programs).sort().map(([code, semesters]) => {
                        return (
                            <optgroup key={code} label={code}>
                                {semesters.sort().map(semester => {
                                    return (
                                        <option key={semester} value={code + semester}>
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
};

const Select = styled.div`
    padding: 1rem;
    background-color: var(--neutral-1);
    width: 90%;
    max-width: 24rem;
    border: 0;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    position: relative;

    & > *:not(select) {
        pointer-events: none;
    }

    & > p {
        color: var(--weak);
    }

    & > select {
        height: 100%;
        width: 100%;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        cursor: pointer;
    }

    @media screen and (hover: hover) {
        &:hover {
            background-color: var(--neutral-2);
        }
    }
`;

const Container = styled.div`
    height: 100dvh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    & > div {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;

        & > svg {
            fill: var(--strong);
            height: 90vw;
            width: 90vw;
            max-width: 12rem;
            max-height: 12rem;
        }

        & > div {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            text-align: center;

            & > h1 {
                font-size: 1.5rem;
                color: var(--strong);
            }

            & > p {
                font-size: 1rem;
                color: var(--weak);
            }
        }
    }
`;