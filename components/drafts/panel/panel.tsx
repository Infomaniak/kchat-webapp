// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';
import classNames from 'classnames';

import {makeIsEligibleForClick} from 'utils/utils';

import './panel.scss';

type Props = {
    isInvalid: boolean;
    children: ({hover}: {hover: boolean}) => React.ReactNode;
    onClick: () => void;
};

const isEligibleForClick = makeIsEligibleForClick('.hljs, code');

function Panel({isInvalid, children, onClick}: Props) {
    const [hover, setHover] = useState(false);

    const handleMouseEnter = () => {
        setHover(true);
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    const handleOnClick = (e: React.MouseEvent<HTMLElement>) => {
        if (isEligibleForClick(e)) {
            onClick();
        }
    };

    return (
        <article
            className={classNames('Panel', {Pannel__dangerous: isInvalid})}
            onMouseOver={handleMouseEnter}
            onClick={handleOnClick}
            onMouseLeave={handleMouseLeave}
            role='button'
        >
            {children({hover})}
        </article>
    );
}

export default memo(Panel);
