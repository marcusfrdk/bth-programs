"use client";

import Link from "next/link";
import Image from "next/image";
import styled from "@emotion/styled";
import Menu from "./Menu";
import { useState } from "react";
import {useData} from "@/contexts/DataProvider";
import {RiMenu3Fill as MenuIconOpen} from "react-icons/ri";
import {MdClose as MenuIconClose} from "react-icons/md";

export default function Header(){
    const { selectedProgram } = useData();
    
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Container className={isOpen ? "open" : ""}>
            <Link href="/" onClick={() => setIsOpen(false)}>
                <Image src="/bth-logo-40.png" height={40} width={40} alt="BTH Logo" />
                <div className="ellipsis">
                    <h1 className="ellipsis">{selectedProgram?.name}</h1>
                    <p className="ellipsis">{(selectedProgram?.code || "") + (selectedProgram?.semester || "")}</p>
                </div>
            </Link>
            <button onClick={() => setIsOpen(v => !v)}>
                {isOpen ? <MenuIconClose size="75%" /> : <MenuIconOpen size="60%" />}
            </button>
            <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        </Container>
    );
};

const Container = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--header-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    gap: 1rem;
    background-color: var(--neutral-0);
    z-index: 100;

    & > a {
        text-decoration: none;
        width: 100%;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 1rem;

        & > img {
            height: 2.5rem;
            width: 2.5rem;
        }
        
        & > div {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;

            & > h1 {
                font-size: 1.125rem;
            }

            & > p {
                font-size: 0.875rem;
                color: var(--weak);
            }
        }
    }

    & > button {
        height: 2.5rem;
        width: 2.5rem;
        min-height: 2.5rem;
        min-width: 2.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
        border-radius: 0.25rem;

    }

    @media screen and (hover: hover){
        & > button {
            &:hover {
                background-color: var(--neutral-1);
            }
        }

        &.open > button {
            &:hover {
                background-color: var(--neutral-2);
            }
        }
    }
`;

