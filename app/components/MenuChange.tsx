"use client";

import styled from "@emotion/styled";
import SelectProgram from "./SelectProgram";

export default function MenuChange(){    
    return (
        <Container>
            <h2>Ändra Program</h2>
            <SelectProgram onSelect={(program) => console.log("")} />
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