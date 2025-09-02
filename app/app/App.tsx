"use client";

import styled from "@emotion/styled";
import Header from "@/components/Header";
import { useData } from "@/contexts/DataProvider";
import SelectInitialProgram from "@/components/SelectInitialProgram";
import Schedule from "@/components/Schedule";
import Banner from "@/components/Banner";

export default function App(){
    const {selectedProgram} = useData();

    if(selectedProgram === "") return <SelectInitialProgram/>;

    return (
        <Container>
            <Header/>
            <Schedule/>
            <Banner/>
        </Container>
    );
};

const Container = styled.main`
    padding-top: var(--header-height);
`;