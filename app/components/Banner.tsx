import styled from "@emotion/styled";
import { useState, useEffect } from "react";

const Banner = () => {
    const [isVisible, setIsVisible] = useState(false);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("showBanner", "0");
    };

    useEffect(() => {
        const stored = localStorage.getItem("showBanner");
        setIsVisible(stored !== "0");
    }, [setIsVisible]);

    return (
        <Wrapper className={isVisible ? "visible" : ""}>
            <p>Då BTH har ändrat sin sida går det för tillfället inte att hämta ny information. Denna sidan kommer inte längre uppdateras. 
                <a 
                    style={{
                        color: "#1c1c1c",
                    }} 
                    href="https://github.com/marcusfrdk/bth-programs"
                >Bidra till projektet här</a></p>
            <button onClick={handleClose}>Stäng</button>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    position: fixed;
    top: -5rem;
    height: 4rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffe900;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: top 256ms ease-in-out;
    width: 100%;
    max-width: calc(100% - 2rem);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1000;

    * {
        color: #1c1c1c;
    }

    & > p {
        width: 100%;
        font-size: 0.875rem;
        line-height: 1rem;

        & > a {
            margin-left: 0.25rem;
        }
    }

    & > button {
        background: none;
        border: none;
        color: #1c1c1c;
        cursor: pointer;
        background-color: #c4b40b;
        height: 2.5rem;
        padding: 0 1rem;
        border-radius: 0.25rem;
    }

    &.visible {
        top: 1rem;
    }
`;

export default Banner;
