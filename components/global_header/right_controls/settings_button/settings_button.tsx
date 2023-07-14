// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import IconButton from '@infomaniak/compass-components/components/icon-button';

import {useDispatch, useSelector} from 'react-redux';

import {TIconGlyph} from '@infomaniak/compass-components/foundations/icon';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants, {RHSStates} from 'utils/constants';
import {GlobalState} from 'types/store';
import {getRhsState} from 'selectors/rhs';
import {closeRightHandSide, showSettings} from 'actions/views/rhs';

type Props = {
    tab?: string;
    className?: string;
    icon?: TIconGlyph;
}

const SettingsButton = ({tab = 'display', className, icon}: Props): JSX.Element | null => {
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
            <FormattedMessage
                id='global_header.productSettings'
                defaultMessage='Settings'
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
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
