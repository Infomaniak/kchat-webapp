// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import type {ValueType} from 'react-select';
import ReactSelect from 'react-select';

import type {PreferenceType} from '@mattermost/types/preferences';

import {Preferences} from 'mattermost-redux/constants';

import RhsSettingsItem from '../../rhs_settings_item/rhs_settings_item';

type Limit = {
    value: number;
    label: string | JSX.Element;
};

type Props = {
    currentUserId: string;
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
    dmGmLimit: number;
}

type State = {
    active: boolean;
    limit: Limit;
    isSaving: boolean;
}

const limits: Limit[] = [
    {
        value: 10000,
        label: (
            <FormattedMessage
                id='user.settings.sidebar.limitVisibleGMsDMs.allDirectMessages'
                defaultMessage='All Direct Messages'
            />
        ),
    },
    {value: 10, label: '10'},
    {value: 15, label: '15'},
    {value: 20, label: '20'},
    {value: 40, label: '40'},
];

export default class RhsLimitVisibleGMsDMs extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            active: false,
            limit: {value: 20, label: '20'},
            isSaving: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (state.active) {
            return {
                active: null,
            };
        }
        return {
            limit: limits.find((l) => l.value === props.dmGmLimit),
        };
    }

    handleChange = (selected: ValueType<Limit>) => {
        if (selected && 'value' in selected) {
            this.setState({active: true, limit: selected}, () => {
                this.handleSubmit();
            });
        }
    };

    handleSubmit = async () => {
        this.setState({isSaving: true});
        await this.props.savePreferences(this.props.currentUserId, [{
            user_id: this.props.currentUserId,
            category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: Preferences.LIMIT_VISIBLE_DMS_GMS,
            value: this.state.limit.value.toString(),
        }]);

        this.setState({isSaving: false});
        this.setState({active: false});
    };

    render() {
        const title = (
            <FormattedMessage
                id='user.settings.sidebar.limitVisibleGMsDMsTitle'
                defaultMessage='Number of direct messages to show'
            />
        );
        return (
            <RhsSettingsItem
                key='limitVisibleGMsDMs'
                title={title}
                inputs={
                    <ReactSelect
                        className='react-select settings-select'
                        classNamePrefix='react-select'
                        id='limitVisibleGMsDMs'
                        options={limits}
                        clearable={false}
                        onChange={(e) => this.handleChange(e)}
                        value={this.state.limit}
                        isSearchable={false}
                        styles={reactStyles}
                    />
                }
                saving={this.state.isSaving}
            />
        );
    }
}

const reactStyles = {
    menuPortal: (provided: React.CSSProperties) => ({
        ...provided,
        zIndex: 9999,
        cursor: 'pointer',
    }),
};
