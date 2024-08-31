"use client";

import styled from "@emotion/styled";
import Header from "@/components/Header";
import { useData } from "@/contexts/DataProvider";
import SelectInitialProgram from "@/components/SelectInitialProgram";

export default function App(){
    const {selectedProgram} = useData();


    if(!selectedProgram) return <SelectInitialProgram/>;

    return (
        <Container>
            <Header/>
        </Container>
    );
};

const Container = styled.main`
    padding-top: var(--header-height);
`;