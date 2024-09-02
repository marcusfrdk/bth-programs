"use client";

import styled from "@emotion/styled";
import CourseModal from "./CourseModal";
import { useData } from "@/contexts/DataProvider";
import { CourseType } from "@/types/Program";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { TbChecklist as CourseRequirements } from "react-icons/tb";
import { PiNumberCircleTwo as CourseDouble } from "react-icons/pi";
import { FaMinus as Minus } from "react-icons/fa";
import { RiCheckboxCircleLine as CourseOptional } from "react-icons/ri";
import ScheduleLoading from "./ScheduleLoading";
import ScheduleError from "./ScheduleError";


type DataType = Record<string, Record<string, CourseType>>;
type ScheduleType = Record<number, Record<number, Record<string, string[]>>>;

const periodOrder = [3, 4, 1, 2];
const periodOrderString = periodOrder.map(v => String(v));

const currentYear = new Date().getFullYear();
const currentWeek = Math.ceil((new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
const currentStudyPeriod = currentWeek < 10 ? 3 : currentWeek < 30 ? 4 : currentWeek < 40 ? 1 : 2;

const emptyCourse: CourseType = {
    code: "code",
    name: "name",
    points: 0,
    semester: "semester",
    start_week: 0,
    end_week: 0,
    period: 0,
    type: "type",
    academic_focus: "academic_focus",
    prerequisites: "prerequisites",
    teacher: "teacher",
    replacement: "replacement",
    next_instance: "next_instance",
    syllabus_url: "syllabus_url",
    education_plan_url: "education_plan_url",
    start_year: 0,
    end_year: 0,
    course_duration: 0,
    is_double: false,
    color: "color"
}

async function fetchProgramData(program: string){
    const res = await fetch(`/data/${program}.json`);
    return await res.json();
}

export default function Schedule(){
    const {selectedProgram, comparedPrograms, removeComparison} = useData();

    const [course, setCourse] = useState<CourseType | null>(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const {data, isLoading, isError} = useQuery<[DataType, ScheduleType]>({
        queryKey: ["programs", selectedProgram, comparedPrograms], 
        queryFn: async () => {
            if(selectedProgram === null || comparedPrograms === null){
                throw new Error("Failed to load programs");
            };

            const programCodes = [
                selectedProgram.code + selectedProgram.semester,
                ...comparedPrograms.map(program => program.code + program.semester)
            ];

            const results = await Promise.all(programCodes.map(fetchProgramData));
            const programs = programCodes.reduce((acc: DataType, program, index) => {
                acc[program] = results[index];
                return acc;
            }, {});

            const schedule: ScheduleType = {};

            const years = Array.from(new Set(Object.values(programs).map(program => Object.keys(program["_groups"]).map(v => Number(v))).flat())).sort();

            years.forEach(year => {
                schedule[year] = {};
                Array(4).fill(0).forEach((_, i) => {
                    schedule[year][i + 1] = {};
                    programCodes.forEach(program => {
                        const groups: any = programs[program]["_groups"];
                        const periods = groups[year] || {};
                        const courses = periods[i + 1] || [];
                        schedule[year][i + 1][program] = courses;
                    });
                });
            });

            // Loop through schedule and remove periods whata the programs has empty arrays
            Object.entries(schedule).forEach(([year, periods]) => {
                Object.entries(periods).forEach(([period, programs]) => {
                    const hasCourses = Object.values(programs).some(courses => courses.length > 0);
                    if(!hasCourses){
                        delete schedule[year as any][period as any];
                    }
                });
            });

            const nCourses: Record<string, Record<string, number>> = {};
            Object.entries(schedule).forEach(([year, periods]) => {
                nCourses[year] = {};
                Object.entries(periods).forEach(([period, programs]) => {
                    nCourses[year][period] = Object.values(programs).reduce((maxLength, courses) => {
                        return Math.max(maxLength, courses.length);
                    }, 0);;
                });
            });

            // Loop through schedule and add empty arrays to programs that have less courses than the max
            Object.entries(schedule).forEach(([year, periods]) => {
                Object.entries(periods).forEach(([period, programs]) => {
                    const maxLength = nCourses[year][period];
                    Object.entries(programs).forEach(([program, courses]) => {
                        if(courses.length < maxLength){
                            schedule[year as any][period as any][program] = Array(maxLength).fill(0).map((_, i) => courses[i] || "");
                        }
                    });
                });
            });

            return [programs, schedule];
        },
        enabled: !!selectedProgram && !!comparedPrograms
    });

    const calculateTargetOffset = useCallback(() => {
        if(!isLoading && !isError){
            const currentElement = document.getElementById("current");
            const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
            const offset = (headerHeight + 3) * remSize;
            const currentElementOffset = currentElement?.offsetTop || 0;
            let targetOffset = currentElementOffset - offset;
    
            if(targetOffset <= 0) targetOffset = document.body.scrollHeight - window.innerHeight;
    
            window.scrollTo({ top: targetOffset });
    
            const event = new CustomEvent("schedule-loaded", {
                detail: {targetOffset}
            });
    
            window.dispatchEvent(event);
        }
    }, [isLoading, isError]);

    const handleClick = (course: CourseType) => {
        setCourse(course);
        setModalIsOpen(true);
    }

    useEffect(() => {
        calculateTargetOffset();
    }, [data, isLoading, isError, calculateTargetOffset]);

    if(!selectedProgram || !comparedPrograms || isLoading) return <ScheduleLoading/>;
    if(!data || isError) return <ScheduleError/>;

    return (
        <Container className={Object.keys(data[0]).length > 1 ? "multiple" : "single"}>
            <ul>
                {Object.entries(data[1]).map(([year, periods], i) => {
                    return (
                        <li key={`${year}-${i}`} className="year">
                            <p className={currentYear > Number(year) ? "previous" : ""}>{year}</p>
                            <ul>
                                {Object.entries(periods)
                                .sort(([a], [b]) => periodOrderString.indexOf(a) - periodOrderString.indexOf(b))
                                .map(([period, programs], j) => {
                                    const isCurrent = currentStudyPeriod === Number(period) && currentYear === Number(year);
                                    const isPrevious = currentYear > Number(year) || (currentStudyPeriod > (periodOrder.indexOf(Number(period)) - 1) && currentYear >= Number(year));
                                    
                                    return (
                                        <li key={`${year}-${period}-${j}`} className={`${isPrevious ? "previous" : ""} period`}>
                                            <p id={isCurrent ? "current" : ""}>{[1, 2].includes(j + 1) ? "Vårtermin" : "Hösttermin"} (LP {period})</p>
                                            <ul>
                                                {Object.entries(programs).map(([program, courses], k) => {
                                                    // ...
                                                    
                                                    return (
                                                        <li key={`${year}-${period}-${program}-${k}`} className="program">
                                                            <ul>
                                                                {courses.sort((a, b) => a > b ? -1 : 1).map((code, l) => {
                                                                    let course = data[0][program][code];
                                                                    let empty = !course;

                                                                    if(empty){
                                                                        course = emptyCourse;
                                                                        code = "code";
                                                                    }

                                                                    const hasPrerequisites = course.prerequisites && (course.prerequisites.includes("avkl"));

                                                                    return (
                                                                        <li 
                                                                            key={`${year}-${period}-${program}-${code}-${l}`}
                                                                            className={`${empty ? "empty" : ""} course`}
                                                                            style={{borderLeftColor: course.color}}
                                                                            onClick={() => handleClick(course)}
                                                                        >
                                                                            <div>
                                                                                <p>{course.name}</p>
                                                                                <p>{code} | {course.points} poäng</p>
                                                                            </div>
                                                                            <div>
                                                                                {course.is_double && <CourseDouble fill="var(--muted)" />}
                                                                                {hasPrerequisites && <CourseRequirements stroke="var(--muted)" />}
                                                                                {course?.type?.toLowerCase() !== "obligatorisk" && <CourseOptional fill="var(--muted)" />}
                                                                            </div>
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                    )
                })}   
            </ul>
            <Programs className="programs">
                {Object.keys(data[0]).map((program, i) => {
                    const isClickable = i !== 0;
                    
                    return (
                        <div key={program}>
                            <div className={isClickable ? "clickable" : ""} onClick={() => isClickable && removeComparison(program)}>
                                <p key={program}>{program}</p>
                                {isClickable && <button><Minus/></button>}
                            </div>
                        </div>
                    )
                })}
            </Programs>
            <CourseModal
                course={course}
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
            />
        </Container>
    );
};

const Programs = styled.div`
    background-color: var(--neutral-0);
    display: flex;
    position: fixed;
    bottom: 0;
    z-index: 99;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 64rem;
    height: 3rem;
    user-select: none;

    & > div {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        & > div {
            display: flex;
            align-items: center;
            width: 100%;
            justify-content: center;
            gap: 0.5rem;
            width: fit-content;

            &.clickable {
                cursor: pointer;
            }
            
            & > p {
                font-size: 0.875rem;
                color: var(--muted);
            }

            & > button {
                height: 1.5rem;
                width: 1.5rem;
                background-color: var(--neutral-1);
                border: none;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                pointer-events: none;

                & > svg {
                    fill: var(--muted);
                }
            }
        }
    }

`;

const Container = styled.main`
    padding-bottom: 3rem;
    display: flex;
    width: 100%;
    justify-content: center;
    
    &.single {
        .schedule-program {
            display: none;
        }

        & > div.programs {
            display: none;
        }
    }

    /* --- Year --- */
    & > ul {
        max-width: 64rem;
        width: 100%;

        & > li.year {

            & > p {
                /* Year */
                font-size: 1.5rem;
                font-weight: bold;
                position: sticky;
                top: var(--header-height);
                background-color: var(--neutral-0);
                height: 3rem;
                display: flex;
                align-items: center;
                z-index: 99;
                padding: 0 1rem;

                &.previous {
                    color: var(--muted);
                }
            }
            
            /* --- Period --- */
            & > ul {
                & > li.period {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 0 1rem 1rem 1rem;

                    &.previous {
                        filter: grayscale(100%);

                        & > p {
                            color: var(--muted);
                        }
                    }

                    /* Period */
                    & > p {
                        font-size: 1.25rem;
                        font-weight: bold;
                        background-color: var(--neutral-0);
                        position: sticky;
                        top: calc(var(--header-height) + 3rem);
                        height: 2rem;
                        z-index: 98;
                        display: flex;
                        align-items: center;
                        border-bottom: 1px solid var(--neutral-2);
                        /* color: var(--weak); */
                    }

                    /* --- Program --- */
                    & > ul {
                        display: flex;
                        gap: 1rem;
                        width: 100%;

                        & > li.program {
                            width: 100%;
                            display: flex;
                            flex-direction: column;

                            /* --- Course --- */
                            & > ul {
                                display: flex;
                                flex-direction: column;
                                gap: 1rem;
                                width: 100%;
                                box-sizing: border-box;
                                flex: 1 1 0;

                                & > li.course {
                                    background-color: var(--neutral-1);
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 0.25rem;
                                    font-size: 0.875rem;
                                    border-left: 0.125rem solid;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    cursor: pointer;
                                    
                                    &.empty {
                                        opacity: 0;
                                        pointer-events: none;
                                        user-select: none;
                                    }

                                    /* Left */
                                    & > div:first-of-type {
                                        display: flex;
                                        flex-direction: column;
                                        width: 100%;
                                        overflow: hidden;

                                        & > p {
                                            line-height: 1.25rem;
                                            max-height: 3.75rem;
                                            overflow: hidden;
                                            word-break: break-word;
                                        
                                            /* Name */
                                            &:first-of-type {

                                            }

                                            /* Code */
                                            &:last-of-type {
                                                font-size: 0.875rem;
                                                color: var(--weak);
                                            }
                                        }
                                    }
                                    
                                    /* Right */
                                    & > div:last-of-type {
                                        display: flex;
                                        align-items: center;
                                        gap: 0.5rem;

                                        & > svg {
                                            font-size: 1.25rem;
                                        }
                                    }

                                    @media screen and (hover: hover) {
                                        &:hover {
                                            background-color: var(--neutral-2);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;