// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Toggle from 'components/toggle';

import Constants from 'utils/constants';

import {UserProfile} from '@mattermost/types/users';
import {PreferenceType} from '@mattermost/types/preferences';

import {ActionResult} from 'mattermost-redux/types/actions';

import RhsSettingsItem from '../rhs_settings_item/rhs_settings_item';

type Settings = {
    sync_drafts: string;
};

export type Props = {
    currentUser: UserProfile;
    syncDrafts: string;
    updateSection: (section?: string) => void;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
    };
};

type State = {
    settings: Settings;
    isSaving: boolean;
    serverError: string;
}

export default class AdvancedRhsSettingsDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const settings: Settings = {
            sync_drafts: this.props.syncDrafts,
        };
        this.state = {
            settings,
            isSaving: false,
            serverError: '',
        };
    }

    handleSubmit = async (settings: string[] | Settings): Promise<void> => {
        const preferences: PreferenceType[] = [];
        const {actions, currentUser} = this.props;
        const userId = currentUser.id;

        // this should be refactored so we can actually be certain about what type everything is
        (Array.isArray(settings) ? settings : [settings]).forEach((setting) => {
            preferences.push({
                user_id: userId,
                category: Constants.Preferences.CATEGORY_ADVANCED_SETTINGS,
                name: setting,
                value: String(this.state.settings[setting]),
            });
        });

        this.setState({isSaving: true});

        await actions.savePreferences(userId, preferences);
    }

    setSettingsStateValue = (key: string, value: string | boolean): void => {
        const data: {[key: string]: string | boolean } = {};
        data[key] = value;
        this.setState((prevState) => ({
            ...prevState,
            settings: {
                ...prevState.settings,
                ...data,
            },
        }), () => {
            this.handleSubmit(['sync_drafts']);
        });
    }

    createDraftsSection = () => {
        return (
            <RhsSettingsItem
                key='syncDrafts'
                title={
                    <FormattedMessage
                        id='user.settings.advance.syncDrafts.Title'
                        defaultMessage='Allow message drafts to sync with the server'
                    />
                }
                inputs={
                    <Toggle
                        id={name + 'childOption'}
                        onToggle={() => this.setSettingsStateValue('sync_drafts', !this.state.settings.sync_drafts)}
                        toggled={this.state.settings.sync_drafts === 'true'}
                    />
                }
                updateSection={
                    this.props.updateSection
                }
                messageDesc={
                    <FormattedMessage
                        id='user.settings.advance.syncDrafts.Desc'
                        defaultMessage='When enabled, message drafts are synced with the server so they can be accessed from any device. When disabled, message drafts are only saved locally on the device where they are composed.'
                    />
                }
                containerStyle='rhs-custom-bb'
            />
        );
    }

    render() {
        const syncDraftsSection = this.createDraftsSection();

        return (
            <div id='displaySettings'>
                <div className='user-settings user-rhs-container container mt-0'>
                    <h5>
                        <FormattedMessage
                            id='drafts.heading'
                            defaultMessage='Drafts'
                        />
                    </h5>
                    <div className='divider-dark mt-5 rhs-custom-bb'/>

                    {syncDraftsSection}
                </div>
            </div>
        );
    }
}
