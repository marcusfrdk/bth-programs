import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import { useMemo } from "react";

import { IoMdRemove as RemoveIcon } from "react-icons/io";
import { FaPlus as AddIcon } from "react-icons/fa6";

export default function MenuCompare(){
    const {data, selectedProgram, comparedPrograms, addComparison, removeComparison} = useData();

    const disabledSelections = useMemo(() => {
        if(!data || !selectedProgram) return [];

        const disabled: string[] = comparedPrograms.map(program => program.code + program.semester);
        disabled.push(selectedProgram.code + selectedProgram.semester);

        return disabled;
    }, [data, selectedProgram, comparedPrograms]);

    return (
        <Container>
            {comparedPrograms.map(program => {
                return (
                    <Added key={program.code + program.semester}>
                        <div>
                            <p className="ellipsis">{program.code + program.semester}</p>
                            <p className="ellipsis">{program.name}</p>
                        </div>
                        <button onClick={() => removeComparison(program.code + program.semester)}>
                            <RemoveIcon size="60%" fill="var(--weak)" />
                        </button>
                    </Added>
                );
            })}

            <New>
                <p>Add comparison</p>
                <div>
                    <AddIcon size="1.5rem" fill="var(--muted)" />
                </div>
                <select onChange={(e) => addComparison(e.target.value)}>
                    {Object.entries(data).sort().map(([code, semesters]) => {
                        return (
                            <optgroup key={code} label={code}>
                                {semesters.map(semester => {
                                    const isDisabled = disabledSelections.includes(code + semester);

                                    return (
                                        <option disabled={isDisabled} key={semester} value={code + semester}>
                                            {semester}
                                        </option>
                                    );
                                })}
                            </optgroup>
                        );
                    })}
                </select>
            </New>
        </Container>
    );
}

const Container = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    list-style: none;
`;

const Added = styled.li`
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: var(--neutral-2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    & > div {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        width: 100%;
        overflow: hidden;

        /* Program */
        & > p:first-of-type {
            font-size: 1rem;
            font-weight: bold;
            color: var(--strong);
        }

        /* Name */
        & > p:last-of-type {
            font-size: 0.875rem;
            color: var(--weak);
        }
    }

    & > button {
        height: 2.5rem;
        width: 2.5rem;
        font-size: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--neutral-3);
        border-radius: 50%;
        border: none;
        transition: background-color 32ms ease-in-out;
        cursor: pointer;

        @media screen and (hover: hover) {
            &:hover {
                background-color: var(--neutral-4);
            }
        }
    }
`;

const New = styled.div`
    padding: 1rem;
    width: 100%;
    background-color: var(--neutral-2);
    border-radius: 0.5rem;
    cursor: pointer;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 64ms ease-in-out;

    & > p {
        color: var(--weak);
    }

    & > div {
        height: 2.5rem;
        width: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    & > select {
        opacity: 0;
        border: none;
        background-color: red;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        position: absolute;
        cursor: pointer;
    }

    @media screen and (hover: hover){
        &:hover {
            background-color: var(--neutral-3);
        }
    }
`;
