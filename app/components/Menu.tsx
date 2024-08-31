import styled from "@emotion/styled";

type Props = {
    isOpen: boolean;
};

export default function Menu({isOpen}: Props){
    return (
        <Container className={isOpen ? "open" : ""}>
            <p>This is a menu</p>
        </Container>
    );
};

const Container = styled.menu`
    position: fixed;
    z-index: 100;
    top: var(--header-height);
    right: 0;
    width: 100%;
    height: calc(100% - var(--header-height));
    background-color: var(--bottom);
    transform: translateX(100%);
    transition: transform 512ms ease-in-out;
    padding: 1rem;
    
    &.open {
        transform: translateX(0);
    }
`;