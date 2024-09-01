"use client";

import {createPortal} from "react-dom";
import styled from "@emotion/styled";
import { CourseType } from "@/types/Program";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { useData } from "@/contexts/DataProvider";
import {MdClose as CloseIcon} from "react-icons/md";
import Link from "next/link";
import { capitalize } from "lodash";

type Props = {
    course: CourseType | null;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function CourseModal({
    course,
    isOpen,
    setIsOpen
}: Props) {
    const {teachers} = useData();

    const teacher = useMemo(() => {
        if(course === null || !teachers[course.teacher]) return;
        return teachers[course.teacher];
    }, [course, teachers]);

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
    }, [isOpen, setIsOpen]);

    return createPortal(
        <Container className={isOpen ? "open" : ""}>
            <Modal style={{ borderLeftColor: course?.color }}>
                <button className="close" onClick={() => setIsOpen(false)}>
                    <CloseIcon size="75%" fill="var(--muted)" />
                </button>

                <div className="header">
                    <p>{course?.name}</p>
                    <p>{course?.code}</p>
                </div>

                <div className="content">
                    <div className="multi">
                        <div>
                            <p>Börjar</p>
                            <p>Vecka {course?.start_week}, {course?.start_year}</p>
                        </div>
                        <div>
                            <p>Slutar</p>
                            <p>Vecka {course?.end_week}, {course?.end_year}</p>
                        </div>

                    </div>

                    {course?.points && <div className="simple">
                        <p>Poäng</p>
                        <p>{course.points} högskolepoäng</p>
                    </div>}

                    <div className="simple">
                        <p>Obligatorisk</p>
                        <p>{course?.type ? course?.type.toLowerCase() !== "obligatorisk" ? "Nej" : "Ja" : "Okänt"}</p>
                    </div>

                    {course?.prerequisites && <div className="simple">
                        <p>Förkunskapskrav</p>
                        <p>{course?.prerequisites || "Inga förskunskapskrav krävs"}</p>
                    </div>}
                    
                    {teacher && <div className="simple">
                        <p>Kursansvarig</p>
                        <p>{teacher?.name}</p>
                        {teacher?.unit && <p>{capitalize(teacher.unit)}</p>}
                        {teacher?.email && <Link target="_blank" href={`mailto://${teacher.email}`}>{teacher.email}</Link>}
                        {teacher?.phone && <Link target="_blank" href={`tel://${teacher.phone}`}>{teacher.phone}</Link>}
                        {teacher?.room && <Link target="_blank" href={"https://maps.app.goo.gl/GfqrL3qNg45CUH9k8"}>{teacher.room.toUpperCase()}</Link>}
                    </div>}

                    {course?.syllabus_url && <div className="simple">
                        <p>Länkar</p>
                        <Link target="_blank" href={course?.syllabus_url || ""}>Kursplan</Link>
                    </div>}
                </div>
            </Modal>
            <Overlay onClick={() => setIsOpen(false)}/>
        </Container>, 
        document.getElementById("modal") as HTMLElement
    );
}

const Modal = styled.div`
    padding: 2rem;
    background-color: var(--neutral-1);
    position: relative;
    border-radius: 0.5rem;
    z-index: 1;
    transition: transform 512ms cubic-bezier(0.19, 1, 0.22, 1);
    transform: translateY(0.5rem);
    width: calc(100% - 2rem);
    max-width: 32rem;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    border-left: 0.125rem solid;
    max-height: calc(100% - 4rem);

    /* Header */
    & > div.header {
        padding-right: 2rem;
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
    & > button.close {
        height: 2.5rem;
        width: 2.5rem;
        min-height: 2.5rem;
        min-width: 2.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background: none;
        border: none;
        position: absolute;
        top: 1rem;
        right: 1rem;
    }

    /* Content */
    & > div.content {
        display: flex;
        height: 100%;
        flex-direction: column;
        gap: 1rem;
        overflow-y: scroll;

        /* Simple title and text */
        & > div.simple {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            
            /* Title */
            & > p:first-of-type {
                font-size: 1rem;
                color: var(--weak);
            }
        }
        /* Multiple title/text horizontally */
        & > div.multi {
            display: flex;
            gap: 0.25rem;
            justify-content: space-between;
            
            & > div {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                width: 100%;

                /* Title */
                & > p:first-of-type {
                    font-size: 1rem;
                    color: var(--weak);
                }

            }

        }
    }

`;

const Overlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #00000050;
    z-index: 0;
`;

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 512ms;
    display: flex;
    justify-content: center;
    align-items: center;

    &.open {
        pointer-events: all;
        opacity: 1;

        /* Modal */
        & > div:first-of-type {
            transform: translateY(0);
        }
    }
`;