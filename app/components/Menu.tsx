import styled from "@emotion/styled";
import MenuCompare from "./MenuCompare";
import MenuChange from "./MenuChange";
import ScrollTo from "./ScrollTo";
import { Dispatch, SetStateAction, useEffect } from "react";
import {MdClose as MenuIconClose} from "react-icons/md";
import { useData } from "@/contexts/DataProvider";

type Props = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Menu({isOpen, setIsOpen}: Props){
    const {selectedProgram} = useData();
    
    useEffect(() => {
        const onKeydown = (e: KeyboardEvent) => {
            if(e.key === "Escape") setIsOpen(false);
        };

        if(isOpen){
            window.addEventListener("keydown", onKeydown);
        } else {
            window.removeEventListener("keydown", onKeydown);
        }

        return () => window.removeEventListener("keydown", onKeydown);
    }, [isOpen]);

    return (
        <>
            <Container className={isOpen ? "open" : ""}>
                <CloseContainer>
                    <div>
                        <p className="ellipsis">{selectedProgram?.name}</p>
                        <p>{(selectedProgram?.code || "") + selectedProgram?.semester}</p>
                    </div>
                    <div onClick={() => setIsOpen(false)}>
                        <MenuIconClose size="75%" fill="var(--muted)" />
                    </div>
                </CloseContainer>
                <MenuChange/>
                <MenuCompare/>
            </Container>
            <Overlay className={isOpen ? "open" : ""} onClick={() => setIsOpen(false)} />
            <ScrollTo/>
        </>
    );
};

const CloseContainer = styled.div`
    height: 4rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    /* Text */
    & > div:first-of-type {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        & > p:first-of-type {
            font-size: 1.125rem;
            font-weight: bold;
        }
        & > p:last-of-type {
            font-size: 1rem;
            color: var(--muted);
        }
    }

    /* Button */
    & > div:last-of-type {
        height: 2.5rem;
        width: 2.5rem;
        min-height: 2.5rem;
        min-width: 2.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
`;

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
    gap: 1.5rem;
    flex-direction: column;
    
    &.open {
        transform: translateX(0);
    }
`;
