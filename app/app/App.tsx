"use client";

import styled from "@emotion/styled";
import Header from "@/components/Header";

export default function App(){
    return (
        <Container>
            <Header/>
            <p>Hello world</p>
            <p style={{color: "var(--weak)"}}>Hello world</p>
            <p style={{color: "var(--muted)"}}>Hello world</p>
        </Container>
    );
};

const Container = styled.main`
    padding-top: var(--header-height);
`;