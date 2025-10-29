// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import styled from 'styled-components';

import WithTooltip from 'components/with_tooltip';

import {WCEventTypes} from 'utils/constants';

import miniMonster from 'images/mini-monster.png';

type Props = {
    className?: string;
    show?: boolean;
}

export const reportingToolsOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    document.dispatchEvent(new CustomEvent(WCEventTypes.OPEN_REPORTING_TOOL));
};

const IconWrapper = styled.div`
    padding: 8px;
    cursor: pointer;
    overflow: hidden;
`;

export const ReportingToolsLogo = (): JSX.Element => {
    return (
        <img
            src={miniMonster}
            alt='Reporting Tools logo'
        />
    );
};

const ReportingToolsButton = ({className, show}: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();

    if (!show) {
        return null;
    }

    return (
        <WithTooltip
            title={
                <FormattedMessage
                    id='global_header.reportingTools'
                    defaultMessage='Reporting Tools'
                />
            }
        >
            <IconWrapper
                className={className}
                onClick={reportingToolsOnClick}
                role='button'
                aria-haspopup='dialog'
                aria-label={formatMessage({id: 'global_header.reportingTools', defaultMessage: 'Reporting tools'})}
            >
                <ReportingToolsLogo/>
            </IconWrapper>
        </WithTooltip>
    );
};

export default ReportingToolsButton;
