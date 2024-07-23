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

import SettingItemMax from 'components/setting_item_max';

import {getBrowserTimezone} from 'utils/timezone';

type Actions = {
    updateMe: (user: UserProfile) => Promise<ActionResult>;
}

type OnChangeActions = {
    selectedOption: {
        label: string;
        value: string;
    };
} & ({
    useAutomaticTimezone: true;
    automaticTimezone: string;
} | {
    useAutomaticTimezone: false;
    manualTimezone: string;
});

type Props = {
    user: UserProfile;
    updateSection?: (section: string) => void;
    useAutomaticTimezone: boolean | string;
    automaticTimezone: string;
    manualTimezone: string;
    timezones: Timezone[];
    timezoneLabel: string;
    actions: Actions;
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
            const nextState: OnChangeActions = {
                manualTimezone: selectedOption.value,
                selectedOption,
                useAutomaticTimezone: false,
            };
            this.setState(nextState);
            this.props.onChange?.(nextState);
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
            this.props.updateSection?.('');
            return;
        }

        this.submitUser();
    };

    submitUser = () => {
        const {user, actions} = this.props;
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

        actions.updateMe(updatedUser).
            then((res) => {
                if ('data' in res) {
                    this.props.updateSection?.('');
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

    handleAutomaticTimezone = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const automaticTimezone = getBrowserTimezone();
            const nextState: OnChangeActions = {
                useAutomaticTimezone: true,
                automaticTimezone,
                selectedOption: {
                    label: getTimezoneLabel(this.props.timezones, automaticTimezone),
                    value: automaticTimezone,
                },
            };
            this.setState(nextState);
            this.props.onChange?.(nextState);
        } else {
            const manualTimezone = getBrowserTimezone();
            const nextState: OnChangeActions = {
                useAutomaticTimezone: false,
                manualTimezone,
                selectedOption: {
                    label: getTimezoneLabel(this.props.timezones, manualTimezone),
                    value: manualTimezone,
                },
            };
            this.setState(nextState);
            this.props.onChange?.(nextState);
        }
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
            <div className='checkbox'>
                <label>
                    <input
                        id='automaticTimezoneInput'
                        type='checkbox'
                        checked={useAutomaticTimezone}
                        onChange={this.handleAutomaticTimezone}
                        disabled={noTimezonesFromServer}
                    />
                    <FormattedMessage
                        id='user.settings.timezones.automatic'
                        defaultMessage='Automatic'
                    />

                </label>
            </div>
        );

        const manualTimezoneInput = (
            <div
                className='pt-2'
            >
                <ReactSelect
                    className='react-select react-select-top'
                    classNamePrefix='react-select'
                    id='displayTimezone'
                    menuPortalTarget={document.body}
                    styles={reactStyles}
                    options={timeOptions}
                    clearable={false}
                    onChange={this.onChange}
                    value={this.state.selectedOption}
                    aria-labelledby='changeInterfaceTimezoneLabel'
                    isDisabled={useAutomaticTimezone}
                />
                {serverError}
            </div>
        );

        inputs.push(automaticTimezoneInput);

        inputs.push(manualTimezoneInput);

        inputs.push(
            <div>
                <br/>
                <FormattedMessage
                    id='user.settings.timezones.promote'
                    defaultMessage='Select the time zone used for timestamps in the user interface and email notifications.'
                />
            </div>,
        );
        if (compact) {
            return inputs;
        }
        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.display.timezone'
                        defaultMessage='Timezone'
                    />
                }
                containerStyle='timezone-container'
                width='medium'
                submit={this.changeTimezone}
                saving={this.state.isSaving}
                inputs={inputs}
                updateSection={this.props.updateSection}
            />
        );
    }
}

