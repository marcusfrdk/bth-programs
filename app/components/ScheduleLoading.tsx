"use client";

import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";

export default function ScheduleLoading(){
    const {comparedPrograms} = useData();

    return (
        <Container>
            {Array(5).fill(0).map((_, i) => {
                return (
                    <Block key={i}>
                        <div className="title">
                            {i % 4 == 0 && <div className="year breathing" />}
                            <div className="sp breathing" />
                        </div>

                        <ul className="programs">
                            {Array(comparedPrograms.length + 1).fill(0).map((_, j) => {
                                return (
                                    <li key={j}>
                                        <ul className="courses">
                                            {Array(3).fill(0).map((_, k) => {
                                                return (
                                                    <li 
                                                        key={k} 
                                                        className="course breathing"
                                                    />
                                                )
                                            })}
                                        </ul>
                                    </li>
                                )
                            })}
                        </ul>

                    </Block>
                )
            })}
        </Container>
    );
}

const Block = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 1rem;
    width: 100%;
    max-width: 64rem;

    &:not(:last-child) {
        margin-bottom: 0.5rem;
    }

    .title {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .year {
        width: 4rem;
        height: 2rem;
        background-color: var(--neutral-1);
        border-radius: 0.25rem;
    }
    
    .sp {
        width: 11rem;
        height: 1.5rem;
        background-color: var(--neutral-1);
        border-radius: 0.25rem;
    }

    .programs {
        display: flex;
        gap: 1rem;
        width: 100%;

        & > li {
            width: 100%;
        }
    }

    .courses {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 1rem;
    }
    
    .course {
        height: 3rem;
        width: 100%;
        background-color: var(--neutral-1);
        border-radius: 0.5rem;
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: hidden;
    height: calc(100dvh - var(--header-height));
    width: 100%;

    .breathing {
        animation: breathing 3s infinite ease-in-out;
    }

    @keyframes breathing {
        0% {
            background-color: var(--neutral-1);
        }
        40% {
            background-color: var(--neutral-2);
        }
        60% {
            background-color: var(--neutral-2);
        }
        100% {
            background-color: var(--neutral-1);
        }
    }
`;