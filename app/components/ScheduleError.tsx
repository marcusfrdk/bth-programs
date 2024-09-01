"use client";

import styled from "@emotion/styled";
import {IoIosWarning as Icon} from "react-icons/io";

export default function ScheduleError(){
    return (
        <Container>
            <Icon size="5rem" />
            <p className="description">Ett fel har inträffat, var vänlig och ladda om sidan.</p>
            <button onClick={() => window.location.reload()}>Ladda om sidan</button>
        </Container>
    );
}

const Container = styled.div`
    height: calc(100dvh - var(--header-height));
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;

    & > p.description {
        width: 56ch;
        max-width: 90%;
        text-align: center;
    }

    & > button {
        height: 2.5rem;
        padding: 0 1.5rem;
        background-color: var(--neutral-1);
        border: none;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        cursor: pointer;
        color: var(--weak);

        @media screen and (hover: hover) {
            &:hover {
                background-color: var(--neutral-2);
            }
        }
    }
`;