"use client";

import { useData } from "@/contexts/DataProvider";
import { CourseType } from "@/types/Program";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";

async function fetchProgramData(program: string){
    const res = await fetch(`/data/${program}.json`);
    return await res.json();
}

export default function Schedule(){
    const {selectedProgram, comparedPrograms, teachers} = useData();
    const {data, isLoading, isError} = useQuery<Record<string, Record<string, CourseType>>>({
        queryKey: ["programs", selectedProgram, comparedPrograms], 
        queryFn: async () => {
            if(selectedProgram === null || comparedPrograms === null){
                throw new Error("Failed to load programs");
            };

            const programs = [
                selectedProgram.code + selectedProgram.semester,
                ...comparedPrograms.map(program => program.code + program.semester)
            ];

            const results = await Promise.all(programs.map(fetchProgramData));

            return programs.reduce((acc: Record<string, Record<string, CourseType>>, program, index) => {
                acc[program] = results[index];
                return acc;
            }, {});
        },
        enabled: !!selectedProgram && !!comparedPrograms
    });

    if(!selectedProgram || !comparedPrograms || isLoading) return <Container>Loading...</Container>;
    if(!data || isError) return <Container>Failed to load schedule</Container>;

    return (
        <Container>
            <h2>Schedule</h2>

            <ul>
                {/* <p>{JSON.stringify(data)}</p> */}
                {Object.entries(data).map(([program, courses]) => {
                    return (
                        <li key={program}>
                            {program}
                        </li>
                    )
                })}
            </ul>

        </Container>
    );
};

const Container = styled.main``;