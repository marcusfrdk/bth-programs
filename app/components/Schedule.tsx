"use client";

import { useData } from "@/contexts/DataProvider";
import { CourseType } from "@/types/Program";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";

type DataType = Record<string, Record<string, CourseType>>;
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

    if(!selectedProgram || !comparedPrograms || isLoading) return <Container>Loading...</Container>;
    if(!data || isError) return <Container>Failed to load schedule</Container>;

    return (
        <Container className={Object.keys(data[0]).length > 1 ? "multiple" : "single"}>
            {/* <h2>Schedule</h2> */}
            <ul>
                {Object.entries(data[1]).map(([year, periods]) => {
                    return (
                        <li key={year} className="year">
                            <p>{year}</p>
                            <ul>
                                {Object.entries(periods)
                                .sort(([a], [b]) => periodOrder.indexOf(a) - periodOrder.indexOf(b))
                                .map(([period, programs], i) => {
                                    return (
                                        <li key={i} className="period">
                                            <p>{[1, 2].includes(i + 1) ? "Spring" : "Fall"} (LP {period})</p>
                                            <ul>
                                                {Object.entries(programs).map(([program, courses], i) => {
                                                    return (
                                                        <li key={i} className="program">
                                                            <ul>
                                                                {courses.sort().map((code, i) => {
                                                                    const course = data[0][program][code];

                                                                    return (
                                                                        <li 
                                                                            key={i} 
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
        </Container>
    );
};

const Container = styled.main`
    &.single {
        .schedule-program {
            display: none;
        }
    }

    /* Year */
    & > ul {
        & > li {

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
            
            /* Period */
            & > ul {
                & > li {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 0 1rem 1rem 1rem;

                    & > p {
                        /* Period */
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

                    /* Program */
                    & > ul {
                        display: flex;
                        gap: 1rem;
                        width: 100%;
                        
                        & > li {
                            width: 100%;
                            display: flex;
                            flex-direction: column;

                            /* Course */
                            & > ul {
                                display: flex;
                                flex-direction: column;
                                gap: 0.5rem;
                                height: 100%;
                                
                                & > li {
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