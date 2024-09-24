// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import './action.scss';
import WithTooltip from 'components/with_tooltip';

type Props = {
    icon: string | React.FC<React.HTMLAttributes<HTMLSpanElement>>;
    id: string;
    name: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    tooltipText: React.ReactElement | string;
};

function Action({name, icon, onClick, id, tooltipText}: Props) {
    const Icon = typeof icon === 'string' ? null : icon;
    return (
        <div className='DraftAction'>
            <WithTooltip
                id={`drafts_action_tooltip_${id}`}
                placement='top'
                title={tooltipText}
            >
                <button
                    className={classNames(
                        'DraftAction__button',
                        {'DraftAction__button--delete': name === 'delete'},
                    )}
                    id={`draft_{icon}_${id}`}
                    onClick={onClick}
                >
                    {Icon ? <Icon className='DraftAction__icon icon'/> : <i className={`icon ${icon}`}/>}
                </button>
            </WithTooltip>
        </div>
    );
}

export default Action;
