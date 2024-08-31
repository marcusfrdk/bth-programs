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
    const { programName } = useData();
    
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Container className={isOpen ? "open" : ""}>
            <Link href="/" onClick={() => setIsOpen(false)}>
                <Image src="/bth-logo-40.png" height={40} width={40} alt="BTH Logo" />
                <h1>{programName}</h1>
            </Link>
            <button onClick={() => setIsOpen(v => !v)}>
                {isOpen ? <MenuIconClose size="75%" /> : <MenuIconOpen size="60%" />}
            </button>
            <Menu isOpen={isOpen} />
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
    background-color: var(--background);
    transition: background-color 512ms ease-in-out;

    &.open {
        background-color: var(--bottom);
    }

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
        
        & > h1 {
            font-size: 1.125rem;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        @media screen and (hover: hover) {
            &:hover {
                & > h1 {
                    text-decoration: underline;
                }
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
        transition: background-color 64ms ease-in-out;
        cursor: pointer;
        border-radius: 0.25rem;

        @media screen and (hover: hover){
            &:hover {
                background-color: var(--bottom);
            }
        }
    }
`;

