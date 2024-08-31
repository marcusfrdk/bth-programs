import { useData } from "@/contexts/DataProvider";
import styled from "@emotion/styled";
import MenuCompare from "./MenuCompare";
import MenuChange from "./MenuChange";

type Props = {
    isOpen: boolean;
};

export default function Menu({isOpen}: Props){
    return (
        <Container className={isOpen ? "open" : ""}>
            <MenuChange/>
            <MenuCompare/>
        </Container>
    );
};

const Container = styled.menu`
    /* padding: 1rem 0; */
    position: fixed;
    z-index: 100;
    top: var(--header-height);
    right: 0;
    width: 100%;
    height: calc(100dvh - var(--header-height));
    background-color: var(--neutral-1);
    transform: translateX(100%);
    transition: transform 512ms ease-in-out;
    padding: 1rem;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    
    &.open {
        transform: translateX(0);
    }
`;