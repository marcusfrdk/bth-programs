"use client";

import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

async function fetchProgramData(program: string){
    const res = await fetch(`/data/${program}.json`);
    return await res.json();
}

export default function Schedule(){
    const {selectedProgram, comparedPrograms} = useData();
    const {data, isLoading, isError} = useQuery({
        queryKey: ["programs", selectedProgram, comparedPrograms], 
        queryFn: async () => {
            if(selectedProgram === null || comparedPrograms === null){
                throw new Error("Failed to load programs");
            };

            const programs = [
                selectedProgram.code + selectedProgram.semester,
                ...comparedPrograms.map(program => program.code + program.semester)
            ];

            return Promise.all(programs.map(fetchProgramData));
        },
        enabled: !!selectedProgram && !!comparedPrograms
    });

    if(!selectedProgram || !comparedPrograms || isLoading) return <Container>Loading...</Container>;
    if(isError) return <Container>Failed to load schedule</Container>;

    return (
        <Container>
            <h2>Schedule</h2>
            {JSON.stringify(data?.map((program) => Object.keys(program)))}
        </Container>
    );
};

const Container = styled.main``;