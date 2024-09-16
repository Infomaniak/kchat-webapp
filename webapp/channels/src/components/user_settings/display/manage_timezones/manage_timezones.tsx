// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import type {ValueType} from 'react-select';
import ReactSelect from 'react-select';
import type {Timezone} from 'timezones.json';

import type {UserProfile} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';
import {getTimezoneLabel} from 'mattermost-redux/utils/timezone_utils';

import ExternalLink from 'components/external_link';
import SettingItemMax from 'components/setting_item_max';
import Toggle from 'components/toggle';

import {getBrowserTimezone} from 'utils/timezone';

type Actions = {
    updateMe: (user: UserProfile) => Promise<ActionResult>;
    patchUser: (user: UserProfile) => Promise<ActionResult>;
}

type OnChangeActions = {
    selectedOption: {
        label: string;
        value: string;
    };
} & ({
    useAutomaticTimezone: boolean;
    automaticTimezone: string;
    manualTimezone: string;
});

type Props = {
    user: UserProfile;
    updateSection: (section: string) => void;
    useAutomaticTimezone: boolean | string;
    automaticTimezone: string;
    manualTimezone: string;
    timezones: Timezone[];
    timezoneLabel: string;
    actions: Actions;
    adminMode?: boolean;
    compact?: boolean;
    onChange?: (values: OnChangeActions) => void;
}
type SelectedOption = {
    value: string;
    label: string;
}

type State = {
    useAutomaticTimezone: boolean;
    automaticTimezone: string;
    manualTimezone: string;
    isSaving: boolean;
    serverError?: string;
    openMenu: boolean;
    selectedOption: SelectedOption;
}

export default class ManageTimezones extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        const useAutomaticTimezone = (
            props.useAutomaticTimezone === 'true' ||
            props.useAutomaticTimezone === true
        );
        this.state = {
            useAutomaticTimezone,
            automaticTimezone: props.automaticTimezone,
            manualTimezone: props.manualTimezone,
            isSaving: false,
            openMenu: false,
            selectedOption: {
                label: props.timezoneLabel,
                value: useAutomaticTimezone ? props.automaticTimezone : props.manualTimezone,
            },
        };
    }

    onChange = (selectedOption: ValueType<SelectedOption>) => {
        if (selectedOption && 'value' in selectedOption) {
            this.setState({
                manualTimezone: selectedOption.value,
                automaticTimezone: selectedOption.value,
                selectedOption,
                useAutomaticTimezone: false,
            });
            this.props.onChange?.({
                manualTimezone: selectedOption.value,
                automaticTimezone: selectedOption.value,
                selectedOption,
                useAutomaticTimezone: false,
            });
        }
    };

    timezoneNotChanged = () => {
        const {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone,
        } = this.state;

        const {
            useAutomaticTimezone: oldUseAutomaticTimezone,
            automaticTimezone: oldAutomaticTimezone,
            manualTimezone: oldManualTimezone,
        } = this.props;

        return (
            useAutomaticTimezone === oldUseAutomaticTimezone &&
            automaticTimezone === oldAutomaticTimezone &&
            manualTimezone === oldManualTimezone
        );
    };

    changeTimezone = () => {
        if (this.timezoneNotChanged()) {
            this.props.updateSection('');
            return;
        }

        this.submitUser();
    };

    submitUser = () => {
        const {user} = this.props;
        const {useAutomaticTimezone, automaticTimezone, manualTimezone} = this.state;

        const timezone = {
            useAutomaticTimezone: useAutomaticTimezone.toString(),
            automaticTimezone,
            manualTimezone,
        };

        const updatedUser = {
            ...user,
            timezone,
        };

        const action = this.props.adminMode ? this.props.actions.patchUser : this.props.actions.updateMe;
        action(updatedUser).
            then((res) => {
                if ('data' in res) {
                    this.props.updateSection('');
                } else if ('error' in res) {
                    const {error} = res;
                    let serverError;
                    if (error instanceof Error) {
                        serverError = error.message;
                    } else {
                        serverError = error as string;
                    }
                    this.setState({serverError, isSaving: false});
                }
            });
    };

    handleAutomaticTimezone = () => {
        const useAutomaticTimezone = !this.state.automaticTimezone;
        const manualTimezone = '';
        let automaticTimezone = '';
        let timezoneLabel: string;
        let selectedOptionValue: string;

        if (useAutomaticTimezone) {
            automaticTimezone = getBrowserTimezone();
            timezoneLabel = getTimezoneLabel(this.props.timezones, automaticTimezone);
            selectedOptionValue = automaticTimezone;
        } else {
            timezoneLabel = getTimezoneLabel(this.props.timezones, getBrowserTimezone());
            selectedOptionValue = getBrowserTimezone();
            this.setState({
                manualTimezone: getBrowserTimezone(),
            });
        }

        this.setState({
            useAutomaticTimezone,
            automaticTimezone,
            selectedOption: {label: timezoneLabel, value: selectedOptionValue},
        });
        this.props.onChange?.({
            useAutomaticTimezone,
            manualTimezone,
            automaticTimezone,
            selectedOption: {label: timezoneLabel, value: selectedOptionValue},
        });
    };

    handleManualTimezone = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({manualTimezone: e.target.value});
    };
    render() {
        const {timezones, compact} = this.props;
        const {useAutomaticTimezone} = this.state;

        const timeOptions = this.props.timezones.map((timeObject) => {
            return {
                value: timeObject.utc[0],
                label: timeObject.text,
            };
        });
        let serverError;
        if (this.state.serverError) {
            serverError = <label className='has-error'>{this.state.serverError}</label>;
        }

        const inputs = [];
        const reactStyles = {

            menuPortal: (provided: React.CSSProperties) => ({
                ...provided,
                zIndex: 9999,
            }),

        };

        const noTimezonesFromServer = timezones.length === 0;
        const automaticTimezoneInput = (

            // <div className='checkbox'>
            //     <label>
            //         <input
            //             id='automaticTimezoneInput'
            //             type='checkbox'
            //             checked={useAutomaticTimezone}
            //             onChange={this.handleAutomaticTimezone}
            //             disabled={noTimezonesFromServer}
            //         />
            //         <FormattedMessage
            //             id='user.settings.timezones.automatic'
            //             defaultMessage='Automatic'
            //         />

            //     </label>
            // </div>
            <Toggle
                id={'automaticTimezoneInput childOption'}
                onToggle={this.handleAutomaticTimezone}
                toggled={useAutomaticTimezone}
            />
        );

        const manualTimezoneInput = (
            <div
                className='pt-2 pb-4'
            >
                {!useAutomaticTimezone &&
                <ExternalLink
                    href='https://manager.infomaniak.com/v3/ng/profile/user/dashboard'
                    target='_blank'
                >
                    <FormattedMessage
                        id='user.settings.timezones.modify'
                        defaultMessage='Change your time zone'
                    />
                </ExternalLink>}
            </div>
        );

        inputs.push(automaticTimezoneInput);

        inputs.push(manualTimezoneInput);

        // inputs.push(
        //     <div>
        //         <br/>
        //         <FormattedMessage
        //             id='user.settings.timezones.promote'
        //             defaultMessage='Select the time zone used for timestamps in the user interface and email notifications.'
        //         />
        //     </div>,
        // );
        if (compact) {
            return inputs;
        }
        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.display.timezone2'
                        defaultMessage='Automatic timezone'
                    />
                }
                containerStyle='timezone-container'
                submit={this.changeTimezone}
                saving={this.state.isSaving}
                inputs={inputs}
                updateSection={this.props.updateSection}
            />
        );
    }
}

