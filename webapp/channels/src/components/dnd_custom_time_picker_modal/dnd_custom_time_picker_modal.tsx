// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Moment} from 'moment-timezone';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {UserStatus} from '@mattermost/types/users';

import type {ActionFunc} from 'mattermost-redux/types/actions';

import DateTimeInputContainer, {getRoundedTime} from 'components/custom_status/date_time_input';
import {GenericModal} from '@mattermost/components';

import Constants, {UserStatuses} from 'utils/constants';
import {toUTCUnix} from 'utils/datetime';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import {isKeyPressed, localizeMessage} from 'utils/utils';

import './dnd_custom_time_picker_modal.scss';

type Props = {
    onExited: () => void;
    userId: string;
    currentDate: Date;
    timezone?: string;
    actions: {
        setStatus: (status: UserStatus) => ActionFunc;
    };
};

type State = {
    time: Moment;
    isMenuOpen: boolean;
    isPopperOpen: boolean;
}

export default class DndCustomTimePicker extends React.PureComponent<Props, State> {
    private buttonRef = React.createRef<HTMLButtonElement>();
    constructor(props: Props) {
        super(props);
        const currentTime = getCurrentMomentForTimezone(props.timezone);
        const initialTime = getRoundedTime(currentTime);
        this.state = {
            time: initialTime,
            isMenuOpen: false,
            isPopperOpen: false,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (event: KeyboardEvent) => {
        if (isKeyPressed(event, Constants.KeyCodes.ESCAPE) && !this.state.isPopperOpen && !this.state.isMenuOpen) {
            this.props.onExited();
        }
    };

    getText = () => {
        const modalHeaderText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.defaultMsg'
                defaultMessage='Disable notifications until'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.submitButton'
                defaultMessage='Disable Notifications'
            />
        );

        return {
            modalHeaderText,
            confirmButtonText,
        };
    };

    handleConfirm = async () => {
        await this.props.actions.setStatus({
            user_id: this.props.userId,
            status: UserStatuses.DND,
            dnd_end_time: toUTCUnix(this.state.time.toDate()),
            manual: true,
            last_activity_at: toUTCUnix(this.props.currentDate),
        });
        this.props.onExited();
    };

    setTime = (time: Moment) => this.setState({time});

    setIsMenuOpen = (isMenuOpen: boolean) => this.setState({isMenuOpen});

    handlePopperOpenState = (isPopperOpen: boolean) => {
        this.setState({isPopperOpen});
    };

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();
        const {time, isMenuOpen, isPopperOpen} = this.state;

        const isConfirmDisabled = isMenuOpen || isPopperOpen;

        return (
            <GenericModal
                ariaLabel={localizeMessage('dnd_custom_time_picker_modal.defaultMsg', 'Disable notifications until')}
                onExited={this.props.onExited}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                handleConfirm={this.handleConfirm}
                handleEnterKeyPress={this.handleConfirm}
                id='dndCustomTimePickerModal'
                className={'DndModal modal-overflow'}
                tabIndex={-1}
                keyboardEscape={false}
                isConfirmDisabled={isConfirmDisabled}
            >
                <DateTimeInputContainer
                    time={time}
                    timezone={this.props.timezone}
                    handleChange={this.setTime}
                    onMenuChange={this.setIsMenuOpen}
                    setIsDatePickerOpen={this.handlePopperOpenState}
                />
            </GenericModal>
        );
    }
}
