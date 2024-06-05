import styled from 'styled-components';

export const Main = styled.div`
    display: flex;
    align-items: center;
    width: min(600px, 100%);
    margin: 4px 0;
    padding: 16px;
    background: var(--center-channel-bg);
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    box-shadow: 0px 4px 6px rgba(var(--center-channel-color-rgb), 0.12);
    color: var(--center-channel-color);
    border-radius: 4px;
    .sidebar--right & {
        flex-wrap: wrap;
    }
`;

export const Left = styled.div`
    display: flex;
    flex-grow: 10;
    overflow: hidden;
    white-space: nowrap;
    .sidebar--right & {
        flex: 1 0 100%;
    }
`;

export const Right = styled.div`
    display: flex;
    gap: 24px;
    flex-grow: 1;
    .sidebar--right & {
        justify-content: space-between;
        padding-top: 8px;
    }
`;

export const CallIndicator = styled.div<{ ended: boolean }>`
    border-radius: 4px;
    padding: 4px;
    width: 40px;
    height: 40px;
`;

export const MessageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0 12px;
    overflow: hidden;
`;

export const Message = styled.span`
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const SubMessage = styled.div`
    white-space: normal;
`;

export const Duration = styled.span`
    color: var(--center-channel-color);
`;

export const Button = styled.button`
    display: flex;
    align-items: center;
    border: none;
    border-radius: 4px;
    padding: 10px 12px;
    cursor: pointer;
`;

export const JoinButton = styled(Button)`
    color: var(--center-channel-bg);
    background: var(--button-bg);
`;

export const ButtonText = styled.span`
    font-weight: 600;
    margin: 0 8px;
`;
