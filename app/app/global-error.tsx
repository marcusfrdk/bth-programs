"use client";

import styled from "@emotion/styled";
import Link from "next/link";
import {IoIosWarning as Icon} from "react-icons/io";

export default function GlobalError(){
    return (
        <Container>
            <Icon size="5rem" />
            <p className="description">Ett fel har inträffat, var vänlig och ladda om sidan.</p>
            <Link href="/">Gå tillbaka</Link>
        </Container>
    );
}

const Container = styled.main`
    height: calc(100dvh - var(--header-height));
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;

    & > p.description {
        width: 40ch;
        max-width: 90%;
        text-align: center;
    }

    & > a {
        text-decoration: none;
        height: 2.5rem;
        padding: 0 1.5rem;
        background-color: var(--neutral-1);
        border: none;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        cursor: pointer;
        color: var(--weak);
        display: flex;
        align-items: center;

        @media screen and (hover: hover) {
            &:hover {
                background-color: var(--neutral-2);
            }
        }
    }
`;