"use client";

import { useData } from "@/contexts/DataProvider";
import { CourseType } from "@/types/Program";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

type DataType = Record<string, Record<string, CourseType>>;
type ScheduleType = Record<number, Record<number, Record<string, string[]>>>;

const periodOrder = ["3", "4", "1", "2"];

const currentYear = new Date().getFullYear();
const currentWeek = Math.ceil((new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
const currentStudyPeriod = currentWeek < 10 ? 3 : currentWeek < 30 ? 4 : currentWeek < 40 ? 1 : 2;

async function fetchProgramData(program: string){
    const res = await fetch(`/data/${program}.json`);
    return await res.json();
}

export default function Schedule(){
    const {selectedProgram, comparedPrograms} = useData();

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

    useEffect(() => {
        calculateTargetOffset();
    }, [data, isLoading, isError]);

    if(!selectedProgram || !comparedPrograms || isLoading) return <Container>Loading...</Container>;
    if(!data || isError) return <Container>Failed to load schedule</Container>;

    return (
        <Container className={Object.keys(data[0]).length > 1 ? "multiple" : "single"}>
            <ul>
                {Object.entries(data[1]).map(([year, periods]) => {
                    return (
                        <li key={`${year}`} className="year">
                            <p>{year}</p>
                            <ul>
                                {Object.entries(periods)
                                .sort(([a], [b]) => periodOrder.indexOf(a) - periodOrder.indexOf(b))
                                .map(([period, programs], i) => {
                                    return (
                                        <li key={`${year}-${period}`} className="period">
                                            <p id={currentStudyPeriod === Number(period) && currentYear === Number(year) ? "current" : ""}>{[1, 2].includes(i + 1) ? "Spring" : "Fall"} (LP {period})</p>
                                            <ul>
                                                {Object.entries(programs).map(([program, courses], i) => {
                                                    return (
                                                        <li key={`${year}-${period}-${program}`} className="program">
                                                            <ul>
                                                                {courses.sort().map((code, i) => {
                                                                    const course = data[0][program][code];

                                                                    return (
                                                                        <li 
                                                                            key={`${year}-${period}-${program}-${code}`}
                                                                            className="course"
                                                                            style={{borderLeftColor: course.color}}
                                                                        >
                                                                            {code}
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                            {/* {i === 3 && <p style={{width: "100%", backgroundColor: "red"}}>EXAMS</p>}
                                            {i === 1 && <p>EXAMS</p>} */}
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                    )
                })}   
            </ul>
            <div className="programs">
                {Object.keys(data[0]).map(program => {
                    return (
                        <p key={program}>{program}</p>
                    )
                })}
            </div>
        </Container>
    );
};

const Container = styled.main`
    padding-bottom: 3rem;
    
    &.single {
        .schedule-program {
            display: none;
        }

        & > div.programs {
            display: none;
        }
    }

    & > div.programs {
        background-color: var(--neutral-0);
        display: flex;
        position: fixed;
        bottom: 0;
        z-index: 99;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 3rem;

        & > p {
            width: 100%;
            text-align: center;
            font-size: 0.875rem;
            color: var(--muted);
        }
    }

    /* --- Year --- */
    & > ul {
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
            }
            
            /* --- Period --- */
            & > ul {
                & > li.period {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 0 1rem 1rem 1rem;

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
                        color: var(--weak);
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
                                gap: 0.5rem;
                                height: 100%;
                                
                                & > li.course {
                                    background-color: var(--neutral-1);
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 0.25rem;
                                    font-size: 0.875rem;
                                    border-left: 0.125rem solid;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;