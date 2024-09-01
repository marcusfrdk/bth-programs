import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import { useMemo } from "react";

import { IoMdRemove as RemoveIcon } from "react-icons/io";
import { FaPlus as AddIcon } from "react-icons/fa6";

export default function MenuCompare(){
    const {programs, selectedProgram, comparedPrograms, addComparison, removeComparison} = useData();

    const disabledSelections = useMemo(() => {
        if(!programs || !selectedProgram) return [];

        const disabled: string[] = comparedPrograms.map(program => program.code + program.semester);
        disabled.push(selectedProgram.code + selectedProgram.semester);

        return disabled;
    }, [programs, selectedProgram, comparedPrograms]);

    return (
        <Container>
            <h2>Jämför Program</h2>
            <ul>
                {comparedPrograms.length === 0 ? 
                <li className="empty">Inget att jämföra med</li>
                : comparedPrograms.map(program => {
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
            </ul>

            <New>
                <p>Välj program</p>
                <div>
                    <AddIcon size="1.25rem" fill="var(--muted)" />
                </div>
                <select defaultValue="default" onChange={(e) => addComparison(e.target.value)}>
                    <option disabled value="default">Select from {Object.keys(programs).length} programs</option>
                    {Object.entries(programs).sort().map(([code, semesters]) => {
                        return (
                            <optgroup key={code} label={code}>
                                {semesters.sort().map(semester => {
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

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    position: relative;
    overflow-y: auto;

    & > ul {
        list-style: none;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;

        & > li.empty {
            color: var(--weak);
        }
    }
`;

const Added = styled.li`
    padding: 0.75rem;
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
            font-size: 0.875rem;
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
        min-height: 2.5rem;
        min-width: 2.5rem;
        font-size: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border-radius: 50%;
        border: none;
        cursor: pointer;
    }
`;

const New = styled.div`
    padding: 0.25rem 0.75rem;
    width: 100%;
    background-color: var(--neutral-2);
    border-radius: 0.25rem;
    cursor: pointer;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > *:not(select) {
        pointer-events: none;
    }

    & > p {
        color: var(--weak);
        font-size: 1rem;
    }

    & > div {
        min-height: 2.5rem;
        min-width: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    & > select {
        opacity: 0;
        border: none;
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
