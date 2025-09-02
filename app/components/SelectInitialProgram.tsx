"use client";

import {useEffect, type ChangeEvent} from "react";
import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import splitProgram from "@/utils/splitProgram";
import Logo from "@/public/bth-logo.svg";
import setCookie from "@/utils/setCookie";
import SelectProgram from "./SelectProgram";

export default function SelectInitialProgram(){
    const {programs, updateSelectedProgram} = useData();

    useEffect(() => {
        // Since the user already has seen
        // the banner, there is no need to
        // show it again.
        localStorage.setItem("showBanner", "0");
    }, []);
    
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

            <div
                style={{
                    backgroundColor: "#ffe900",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginTop: "1rem",
                    maxWidth: "54ch",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                }}
            >
                <p 
                    style={{
                        color: "#1c1c1c",
                    }}
                >Då BTH har ändrat sin sida går det för tillfället inte att hämta ny information. Denna sidan kommer inte längre uppdateras.</p>
                <a style={{
                    color: "#1c1c1c",
                }} href="https://github.com/marcusfrdk/bth-programs">Bidra till projektet här</a>
            </div>
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