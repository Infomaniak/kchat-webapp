import styled from 'styled-components';

import Tag from 'components/widgets/tag/tag';

const ITEM_HEIGHT = 40;

export const getListHeight = (num: number) => (num * ITEM_HEIGHT);

export const UserList = styled.div`
    padding: 0;
    margin: 0;
    border-top: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    box-sizing: content-box;
    position: relative;
    overflow-y: auto;
`;

export const UserListItem = styled.div<{first?: boolean; last?: boolean}>`
    width: 100%;
    position: relative;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }

    &:hover .user-tag {
        display: none;
    }

    .group-member-list_gap {
        display: none;
    }

    .group-member-list_dm-button {
        opacity: 0;
    }

    &:hover .group-member-list_gap,
    &:focus-within .group-member-list_gap {
        display: initial;
    }

    &:hover .group-member-list_dm-button,
    &:focus-within .group-member-list_dm-button {
        opacity: 1;
    }
`;

export const UserButton = styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 20px;
    border: none;
    background: unset;
    text-align: unset;
`;

export const ProfileTag = styled(Tag)``;

// A gap to make space for the DM button to be positioned on
export const Gap = styled.span`
    width: 24px;
    flex: 0 0 auto;
    margin-left: 4px;
`;

export const Username = styled.span`
    padding-left: 12px;
    flex: 1 1 auto;
`;

export const DMContainer = styled.div`
    height: 100%;
    position: absolute;
    right: 20px;
    top: 0;
    display: flex;
    align-items: center;
`;

export const DMButton = styled.button`
    width: 24px;
    height: 24px;

    svg {
        width: 16px;
    }
`;
