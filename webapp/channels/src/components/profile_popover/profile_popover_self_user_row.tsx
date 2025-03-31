// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
type Props = {
    userId: string;
    currentUserId: string;
    haveOverrideProp: boolean;
    hide?: () => void;
    returnFocus: () => void;
    handleCloseModals: () => void;
    handleShowDirectChannel: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProfilePopoverSelfUserRow = ({
    userId,
    currentUserId,
    haveOverrideProp,

}: Props) => {
    if (userId !== currentUserId || haveOverrideProp) {
        return null;
    }

    return (
        <div
            className='user-popover__bottom-row-container'
        />
    );
};

export default ProfilePopoverSelfUserRow;
