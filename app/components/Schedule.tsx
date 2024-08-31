"use client";

import { useData } from "@/contexts/DataProvider";
import { CourseType } from "@/types/Program";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type DataType = Record<string, Record<string, Record<string, CourseType>>>;
type ScheduleType = Record<number, Record<number, Record<string, string[]>>>;

const periodOrder = ["3", "4", "1", "2"];

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
                        const groups = programs[program]["_groups"];
                        const periods: any = groups[year] || {};
                        const courses = periods[i + 1] || [];
                        schedule[year][i + 1][program] = courses;
                    });
                });
            });

            return [programs, schedule];
        },
        enabled: !!selectedProgram && !!comparedPrograms
    });

    if(!selectedProgram || !comparedPrograms || isLoading) return <Container>Loading...</Container>;
    if(!data || isError) return <Container>Failed to load schedule</Container>;

    return (
        <Container className={Object.keys(data[0]).length > 1 ? "multiple" : "single"}>
            <h2>Schedule</h2>
            <ul>
                {Object.entries(data[1]).map(([year, periods]) => {
                    return (
                        <li key={year}>
                            <p className="schedule-year">{year}</p>
                            <ul>
                                {Object.entries(periods)
                                .sort(([a], [b]) => periodOrder.indexOf(a) - periodOrder.indexOf(b))
                                .map(([period, programs], i) => {
                                    return (
                                        <li key={i}>
                                            <p className="schedule-period">{period}</p>
                                            <ul>
                                                {Object.entries(programs).map(([program, courses], i) => {
                                                    return (
                                                        <li key={i}>
                                                            <h3 className="schedule-program">{program}</h3>
                                                            <ul>
                                                                {courses.map((course, i) => {
                                                                    return (
                                                                        <li key={i}>
                                                                            {course}
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
        </Container>
    );
};

const Container = styled.main`
    &.single {
        background-color: red;
        .schedule-program {
            display: none;
        }
    }

    /* Year */
    & > ul {
        /* background-color: red; */
    
        & > li {
            /* Period */
            & > ul {
                /* background-color: orange; */

                & > li {
                    /* Program */
                    & > ul {
                        display: flex;
                        gap: 1rem;
                        width: 100%;
                        
                        /* background-color: green; */
                        
                        & > li {
                            /* Course */
                            width: 100%;
                            
                            /* background-color: var(--neutral-2); */
                            /* background-color: blue; */
                            background-color: green;
                        }
                    }
                }
            }
        }
    }

    &.single {
    
    }

    &.multiple {
    }
`;