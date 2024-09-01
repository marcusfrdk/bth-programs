import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import MenuCompare from "./MenuCompare";
import MenuChange from "./MenuChange";
import { Dispatch, SetStateAction } from "react";
import ScrollTo from "./ScrollTo";

type Props = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Menu({isOpen, setIsOpen}: Props){
    return (
        <>
            <Container className={isOpen ? "open" : ""}>
                <MenuChange/>
                <MenuCompare/>
            </Container>
            <Overlay className={isOpen ? "open" : ""} onClick={() => setIsOpen(false)} />
            <ScrollTo/>
        </>
    );
};

const Overlay = styled.div`
    height: 100dvh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #000000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 512ms ease-in-out;

    &.open {
        opacity: 0.25;
        z-index: 90;
        pointer-events: all;
        cursor: pointer;
    }
`;

const Container = styled.menu`
    /* padding: 1rem 0; */
    position: fixed;
    z-index: 100;
    top: 0;
    right: 0;
    width: 80vw;
    max-width: 28rem;
    height: 100dvh;
    background-color: var(--neutral-1);
    transform: translateX(100%);
    transition: transform 512ms ease-in-out;
    padding: 1rem;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    
    &.open {
        transform: translateX(0);
    }
`;
