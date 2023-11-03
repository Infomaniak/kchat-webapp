// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';
import {useIntl} from 'react-intl';
import {InsightsScopes} from 'utils/constants';
import * as Utils from 'utils/utils';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

type Props = {
    filterType: string;
    setFilterTypeTeam: () => void;
    setFilterTypeMy: () => void;
}

const InsightsTitle = (props: Props) => {
    const {formatMessage} = useIntl();

    const title = useCallback(() => {
        if (props.filterType === InsightsScopes.TEAM) {
            return (
                formatMessage({
                    id: 'insights.teamHeading',
                    defaultMessage: 'Team insights',
                })
            );
        }
        return (
            formatMessage({
                id: 'insights.myHeading',
                defaultMessage: 'My insights',
            })
        );
    }, [props.filterType]);

    return (
        <MenuWrapper id='insightsFilterDropdown'>
            <button className='insights-title'>
                {title()}
                <span className='icon'>
                    <i className='icon icon-chevron-down'/>
                </span>
            </button>
            <Menu
                ariaLabel={Utils.localizeMessage('insights.filter.ariaLabel', 'Insights Filter Menu')}
            >
                <Menu.ItemAction
                    id='insightsDropdownMy'
                    buttonClass='insights-filter-btn'
                    onClick={props.setFilterTypeMy}
                    icon={
                        <span className='icon'>
                            <i className='icon icon-account-outline'/>
                        </span>
                    }
                    text={Utils.localizeMessage('insights.filter.myInsights', 'My insights')}
                />
                <Menu.ItemAction
                    id='insightsDropdownTeam'
                    buttonClass={'insights-filter-btn'}
                    onClick={props.setFilterTypeTeam}
                    icon={
                        <span className='icon'>
                            <i className='icon icon-account-multiple-outline'/>
                        </span>
                    }
                    text={Utils.localizeMessage('insights.filter.teamInsights', 'Team insights')}

                />
            </Menu>
        </MenuWrapper>
    );
};

export default memo(InsightsTitle);
