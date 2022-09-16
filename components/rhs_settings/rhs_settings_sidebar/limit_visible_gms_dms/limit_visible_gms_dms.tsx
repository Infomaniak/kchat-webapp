// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import ReactSelect, {ValueType} from 'react-select';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import {PreferenceType} from '@mattermost/types/preferences';

import {localizeMessage} from 'utils/utils';
import RhsSettingsItem from '../../rhs_settings_item/rhs_settings_item';

type Limit = {
    value: number;
    label: string;
};

type Props = {
    active: boolean;
    currentUserId: string;
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
    dmGmLimit: number;
    updateSection: (section: string) => void;
}

type State = {
    active: boolean;
    limit: Limit;
    isSaving: boolean;
}

const limits: Limit[] = [
    {value: 10000, label: localizeMessage('user.settings.sidebar.limitVisibleGMsDMs.allDirectMessages', 'All Direct Messages')},
    {value: 10, label: '10'},
    {value: 15, label: '15'},
    {value: 20, label: '20'},
    {value: 40, label: '40'},
];

export default class LimitVisibleGMsDMs extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            active: false,
            limit: {value: 20, label: '20'},
            isSaving: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.active !== state.active) {
            if (props.active && !state.active) {
                return {
                    limit: limits.find((l) => l.value === props.dmGmLimit),
                    active: props.active,
                };
            }

            return {
                active: props.active,
            };
        } else if (!props.active) {
            return {
                limit: limits.find((l) => l.value === props.dmGmLimit),
            };
        }

        return null;
    }

    handleChange = (selected: ValueType<Limit>) => {
        if (selected && 'value' in selected) {
            this.setState({active: true, limit: selected}, () => {
                this.handleSubmit();
            });
        }
    }

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

        this.props.updateSection('');
    }

    render() {
        const title = (
            <FormattedMessage
                id='user.settings.sidebar.limitVisibleGMsDMsTitle'
                defaultMessage='Number of direct messages to show'
            />
        );

        return (
            <RhsSettingsItem
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
                        menuPortalTarget={document.body}
                        styles={reactStyles}
                    />
                }
                messageDesc={
                    <FormattedMessage
                        id='user.settings.sidebar.limitVisibleGMsDMsDesc'
                        defaultMessage='You can also change these settings in the direct messages sidebar menu.'
                    />
                }
                saving={this.state.isSaving}
                updateSection={this.props.updateSection}
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
