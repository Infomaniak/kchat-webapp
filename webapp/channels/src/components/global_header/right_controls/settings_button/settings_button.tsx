// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@infomaniak/compass-components/components/icon-button';
import type {TIconGlyph} from '@infomaniak/compass-components/foundations/icon';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import Constants, {RHSStates} from 'utils/constants';

import {closeRightHandSide, showSettings} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import type {GlobalState} from 'types/store';

type Props = {
    tab?: string;
    className?: string;
    icon?: TIconGlyph;
    tooltipPlacement?: string;
    tooltipContent?: string;
}

const SettingsButton = ({tab = 'display', className, icon, tooltipPlacement, tooltipContent}: Props): JSX.Element | null => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));

    const settingButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.SETTINGS) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showSettings(tab));
        }
    };

    const tooltip = (
        <Tooltip id='productSettings'>
            {tooltipContent || (
                <FormattedMessage
                    id='global_header.productSettings'
                    defaultMessage='Settings'
                />
            )}
        </Tooltip>
    );

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement={tooltipPlacement || 'bottom'}
            overlay={tooltip}
        >
            <IconButton
                id='right-controls-settings'
                className={`grey ${rhsState === RHSStates.SETTINGS ? 'active' : ''} ${className || ''}`}
                size={'sm'}
                icon={icon || 'cog'}
                toggled={rhsState === RHSStates.SETTINGS}
                onClick={settingButtonClick}
                inverted={true}
                compact={true}
                aria-haspopup='dialog'
                aria-label={formatMessage({id: 'global_header.productSettings', defaultMessage: 'Settings'})}
            />

        </OverlayTrigger>
    );
};

export default SettingsButton;
