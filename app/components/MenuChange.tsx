"use client";

import styled from "@emotion/styled";
import SelectProgram from "./SelectProgram";
import { useData } from "@/contexts/DataProvider";

export default function MenuChange(){
    const { updateSelectedProgram } = useData();

    return (
        <Container>
            <h2>Ändra Program</h2>
            <SelectProgram onSelect={updateSelectedProgram} />
        </Container>
    );
}

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
`;