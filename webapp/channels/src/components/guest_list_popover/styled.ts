import styled from 'styled-components';

export const Body = styled.div`
    width: 264px;
`;

export const Header = styled.div`
    padding: 16px 20px;
    position: relative;
`;

export const HeaderButton = styled.button`
    padding: 0;
    background: none;
    border: none;
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
`;

export const Title = styled.span`
    flex: 1 1 auto;
`;

export const CloseButton = styled.button`
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    margin-left: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    right: -4px;
    top: -2px;

    /* Place this button above the main header button */
    z-index: 9;

    svg {
        width: 14px;
    }
`;

export const Heading = styled.div`
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    font-family: 'SuisseIntl', sans-serif;
`;

export const Subtitle = styled.div`
    font-size: 12px;
    color: rgba(var(--center-channel-color-rgb), 0.64);
    display: flex;
`;

export const NoShrink = styled.span`
    flex: 0 0 auto;
`;
