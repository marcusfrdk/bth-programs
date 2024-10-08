"use client";

import type {ChangeEvent} from "react";
import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import splitProgram from "@/utils/splitProgram";
import Logo from "@/public/bth-logo.svg";
import setCookie from "@/utils/setCookie";
import SelectProgram from "./SelectProgram";

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
        setCookie("selectedCode", code);
        setCookie("selectedSemester", semester);
    };
    
    return (
        <Container>
            <div className="text">
                <Logo/>
                <div>
                    <h1>BTH Program</h1>
                    <p>Få en överblick över ditt programs kurser och jämför med andra.</p>
                </div>
            </div>

            <SelectProgram
                onSelect={updateSelectedProgram}
                initialText="Välj program"
                disable="none"
                Icon={null}
                style={{
                    maxWidth: "24rem",
                    justifyContent: "center"
                }}
            />
        </Container>
    );
};

const Container = styled.div`
    height: 100dvh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;

    & > div.text {
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
            gap: 0.5rem;
            text-align: center;

            & > h1 {
                font-size: 1.5rem;
                color: var(--strong);
            }

            & > p {
                font-size: 1rem;
                color: var(--weak);
                max-width: 40ch;
            }
        }
    }
`;