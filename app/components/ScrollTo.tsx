"use client";

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import {throttle} from "lodash";
import {
    FaChevronDown as ChevronDown, 
    FaChevronUp as ChevronUp, 
    FaMinus as Minus
} from "react-icons/fa";
import { useData } from "@/contexts/DataProvider";

export default function ScrollTo(){
    const {comparedPrograms} = useData();

    const [target, setTarget] = useState(0);
    const [scrollPos, setScrollPos] = useState(0);

    useEffect(() => {
        const onEvent = (e: any) => setTarget(e.detail.targetOffset);
        const onScroll = throttle(() => setScrollPos(window.scrollY), 100);

        window.addEventListener("schedule-loaded", onEvent);
        window.addEventListener("scroll", onScroll);

        return () => {
            window.removeEventListener("schedule-loaded", onEvent);
            window.removeEventListener("scroll", onScroll);
        }
    }, []);

    return (
        <Container 
            className={`${target === scrollPos ? "hidden" : ""} ${comparedPrograms.length > 0 ? "offset" : ""}`}
            onClick={() => window.scrollTo({ top: target, behavior: "smooth" })}
        >
            {scrollPos < target ? <ChevronDown/> : <ChevronUp/>}
            {/* <p>{target}, {scrollPos}</p> */}
        </Container>
    );
}

const Container = styled.div`
    height: 4rem;
    width: 4rem;
    max-height: 4rem;
    max-width: 4rem;
    /* background-color: var(--neutral-2); */
    background-color: var(--strong);
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    transition-property: opacity, transform;
    transition-duration: 128ms;
    transition-timing-function: ease-in-out;
    transform-origin: center;
    cursor: pointer;

    & > svg {
        height: 40%;
        width: 40%;
        fill: var(--neutral-1);
    }

    &.hidden {
        opacity: 0;
        transform: scale(0);
    }

    &.offset {
        bottom: 4rem;
    }
`;