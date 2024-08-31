"use client";

import styled from "@emotion/styled";
import Header from "@/components/Header";

export default function App(){
    return (
        <Container>
            <Header/>
        </Container>
    );
};

const Container = styled.main`
    padding-top: var(--header-height);
`;