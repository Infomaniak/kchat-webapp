// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import StatusIcon from '@infomaniak/compass-components/components/status-icon'; // eslint-disable-line no-restricted-imports
import Text from '@infomaniak/compass-components/components/text'; // eslint-disable-line no-restricted-imports
import Icon from '@infomaniak/compass-components/foundations/icon';
import type {TUserStatus} from '@infomaniak/compass-components/shared'; // eslint-disable-line no-restricted-imports
import {AccountOutlineIcon, CheckIcon, ExitToAppIcon} from '@infomaniak/compass-icons/components';
import {LogoutMessageKey} from '@infomaniak/ksuite-bridge';
import type {KSuiteBridge} from '@infomaniak/ksuite-bridge';
import classNames from 'classnames';
import React from 'react';
import type {ReactNode} from 'react';
import {injectIntl, FormattedDate, FormattedMessage, FormattedTime, defineMessage, defineMessages} from 'react-intl';
import type {IntlShape, MessageDescriptor} from 'react-intl';

import {PulsatingDot} from '@mattermost/components';
import type {PreferenceType} from '@mattermost/types/preferences';
import {CustomStatusDuration} from '@mattermost/types/users';
import type {UserCustomStatus, UserProfile, UserStatus} from '@mattermost/types/users';

import * as GlobalActions from 'actions/global_actions';

import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import CustomStatusModal from 'components/custom_status/custom_status_modal';
import CustomStatusText from 'components/custom_status/custom_status_text';
import ExpiryTime from 'components/custom_status/expiry_time';
import DndCustomTimePicker from 'components/dnd_custom_time_picker_modal';
import {OnboardingTaskCategory, OnboardingTasksName, TaskNameMapToSteps, CompleteYourProfileTour} from 'components/onboarding_tasks';
import OverlayTrigger from 'components/overlay_trigger';
import ResetStatusModal from 'components/reset_status_modal';
import ToggleNextModal from 'components/toggle_next_modal';
import Tooltip from 'components/tooltip';
import {ProfileTour, StatusTour} from 'components/tours/onboarding_tour';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Avatar from 'components/widgets/users/avatar/avatar';
import type {TAvatarSizeToken} from 'components/widgets/users/avatar/avatar';

import {Constants, ModalIdentifiers, UserStatuses} from 'utils/constants';
import {getCurrentDateTimeForTimezone, getCurrentMomentForTimezone} from 'utils/timezone';

import type {ModalData} from 'types/actions';
import type {Menu as MenuType} from 'types/store/plugins';

import './status_dropdown.scss';

type Props = {
    intl: IntlShape;
    status?: string;
    userId: string;
    profilePicture?: string;
    autoResetPref?: string;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        setStatus: (status: UserStatus) => void;
        unsetCustomStatus: () => void;
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        setStatusDropdown: (open: boolean) => void;
    };
    customStatus?: UserCustomStatus;
    currentUser: UserProfile;
    isCustomStatusEnabled: boolean;
    isCustomStatusExpired: boolean;
    isMilitaryTime: boolean;
    isStatusDropdownOpen: boolean;
    showCompleteYourProfileTour: boolean;
    showCustomStatusPulsatingDot: boolean;
    timezone?: string;
    showProfileTutorialStep: boolean;
    showStatusTutorialStep: boolean;
    showNextSwitch: boolean;
    ksuiteBridge: KSuiteBridge;
    isBridgeConnected: boolean;
}

type State = {
    openUp: boolean;
    width: number;
    isStatusSet: boolean;
};

export const statusDropdownMessages: Record<string, Record<string, MessageDescriptor>> = {
    ooo: defineMessages({
        name: {
            id: 'status_dropdown.set_ooo',
            defaultMessage: 'Out of office',
        },
        extra: {
            id: 'status_dropdown.set_ooo.extra',
            defaultMessage: 'Automatic Replies are enabled',
        },
    }),
    online: defineMessages({
        name: {
            id: 'status_dropdown.set_online',
            defaultMessage: 'Online',
        },
    }),
    away: defineMessages({
        name: {
            id: 'status_dropdown.set_away',
            defaultMessage: 'Away',
        },
    }),
    dnd: defineMessages({
        name: {
            id: 'status_dropdown.set_dnd',
            defaultMessage: 'Do not disturb',
        },
        extra: {
            id: 'status_dropdown.set_dnd.extra',
            defaultMessage: 'Disables all notifications',
        },
    }),
    offline: defineMessages({
        name: {
            id: 'status_dropdown.set_offline',
            defaultMessage: 'Offline',
        },
    }),
};

export class StatusDropdown extends React.PureComponent<Props, State> {
    dndTimes = [
        {id: 'thirty_minutes', label: defineMessage({id: 'status_dropdown.dnd_sub_menu_item.thirty_minutes', defaultMessage: '30 mins'})},
        {id: 'one_hour', label: defineMessage({id: 'status_dropdown.dnd_sub_menu_item.one_hour', defaultMessage: '1 hour'})},
        {id: 'two_hours', label: defineMessage({id: 'status_dropdown.dnd_sub_menu_item.two_hours', defaultMessage: '2 hours'})},
        {id: 'tomorrow', label: defineMessage({id: 'status_dropdown.dnd_sub_menu_item.tomorrow', defaultMessage: 'Tomorrow'})},
        {id: 'custom', label: defineMessage({id: 'status_dropdown.dnd_sub_menu_item.custom', defaultMessage: 'Custom'})},
    ];
    static defaultProps = {
        userId: '',
        profilePicture: '',
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
            width: 0,
            isStatusSet: false,
        };
    }

    // openProfileModal = (): void => {
    //     this.props.actions.openModal({
    //         modalId: ModalIdentifiers.USER_SETTINGS,
    //         dialogType: UserSettingsModal,
    //         dialogProps: {isContentProductSettings: false},
    //     });
    // }

    setStatus = (status: string, dndEndTime?: number): void => {
        this.props.actions.setStatus({
            user_id: this.props.userId,
            status,
            dnd_end_time: dndEndTime,
        });
    };

    isUserOutOfOffice = (): boolean => {
        return this.props.status === UserStatuses.OUT_OF_OFFICE;
    };

    setOnline = (event: Event): void => {
        event.preventDefault();
        this.setStatus(UserStatuses.ONLINE);
    };

    setOffline = (event: Event): void => {
        event.preventDefault();
        this.setStatus(UserStatuses.OFFLINE);
    };

    setAway = (event: Event): void => {
        event.preventDefault();
        this.setStatus(UserStatuses.AWAY);
    };

    setDnd = (index: number): void => {
        const currentDate = getCurrentMomentForTimezone(this.props.timezone);
        let endTime = currentDate;
        switch (index) {
        case 0:
            // add 30 minutes in current time
            endTime = currentDate.add(30, 'minutes');
            break;
        case 1:
            // add 1 hour in current time
            endTime = currentDate.add(1, 'hour');
            break;
        case 2:
            // add 2 hours in current time
            endTime = currentDate.add(2, 'hours');
            break;
        case 3:
            // set to next day 9 in the morning
            endTime = currentDate.add(1, 'day').set({hour: 9, minute: 0});
            break;
        }

        this.setStatus(UserStatuses.DND, endTime.utc().unix());
    };

    setCustomTimedDnd = (): void => {
        const dndCustomTimePicker = {
            modalId: ModalIdentifiers.DND_CUSTOM_TIME_PICKER,
            dialogType: DndCustomTimePicker,
            dialogProps: {
                currentDate: this.props.timezone ? getCurrentDateTimeForTimezone(this.props.timezone) : new Date(),
            },
        };

        this.props.actions.openModal(dndCustomTimePicker);
    };

    showStatusChangeConfirmation = (status: string): void => {
        const resetStatusModalData = {
            modalId: ModalIdentifiers.RESET_STATUS,
            dialogType: ResetStatusModal,
            dialogProps: {newStatus: status},
        };

        this.props.actions.openModal(resetStatusModalData);
    };

    renderProfilePicture = (size: TAvatarSizeToken): ReactNode => {
        if (!this.props.profilePicture) {
            return null;
        }
        return (
            <Avatar
                size={size}
                url={this.props.profilePicture}
                tabIndex={undefined}
            />
        );
    };

    handleClearStatus = (e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement> | React.TouchEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        this.props.actions.unsetCustomStatus();
    };

    handleEmitUserLoggedOutEvent = (): void => {
        if (this.props.isBridgeConnected) {
            this.props.ksuiteBridge.sendMessage({
                type: LogoutMessageKey,
            });
        }
        GlobalActions.emitUserLoggedOutEvent('ikLogout');
    };

    onToggle = (open: boolean): void => {
        this.props.actions.setStatusDropdown(open);
    };

    handleCompleteYourProfileTask = (): void => {
        const taskName = OnboardingTasksName.COMPLETE_YOUR_PROFILE;
        const steps = TaskNameMapToSteps[taskName];
        const currentUserId = this.props.currentUser.id;
        const preferences = [
            {
                user_id: currentUserId,
                category: OnboardingTaskCategory,
                name: taskName,
                value: steps.FINISHED.toString(),
            },
        ];
        this.props.actions.savePreferences(currentUserId, preferences);
    };

    handleCustomStatusEmojiClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        const customStatusInputModalData = {
            modalId: ModalIdentifiers.CUSTOM_STATUS,
            dialogType: CustomStatusModal,
        };
        this.props.actions.openModal(customStatusInputModalData);
    };

    renderCustomStatus = (isStatusSet: boolean | undefined): ReactNode => {
        if (!this.props.isCustomStatusEnabled) {
            return null;
        }
        const {customStatus} = this.props;

        let customStatusText;
        let customStatusHelpText;
        switch (true) {
        case isStatusSet && customStatus?.text && customStatus.text.length > 0:
            customStatusText = customStatus?.text;
            break;
        case isStatusSet && !customStatus?.text && customStatus?.duration === CustomStatusDuration.DONT_CLEAR:
            customStatusHelpText = this.props.intl.formatMessage({id: 'status_dropdown.set_custom_text', defaultMessage: 'Set custom status text...'});
            break;
        case isStatusSet && !customStatus?.text && customStatus?.duration !== CustomStatusDuration.DONT_CLEAR:
            customStatusText = '';
            break;
        case !isStatusSet:
            customStatusHelpText = this.props.intl.formatMessage({id: 'status_dropdown.set_custom', defaultMessage: 'Set a custom status'});
        }

        const customStatusEmoji = isStatusSet ? (
            <span className='d-flex'>
                <CustomStatusEmoji
                    showTooltip={false}
                    emojiStyle={{marginLeft: 0}}
                />
            </span>
        ) : (
            <EmojiIcon className={'custom-status-emoji'}/>
        );

        const pulsatingDot = !isStatusSet && this.props.showCustomStatusPulsatingDot && (
            <PulsatingDot/>
        );

        const clearableTooltip = (
            <Tooltip id={'InputClearTooltip'}>
                <FormattedMessage
                    id={'input.clear'}
                    defaultMessage='Clear'
                />
            </Tooltip>
        );

        const clearButton = isStatusSet && !pulsatingDot && (
            <div
                className={classNames('status-dropdown-menu__clear-container', 'input-clear visible')}
                onClick={this.handleClearStatus}
                onTouchEnd={this.handleClearStatus}
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement={'left'}
                    overlay={clearableTooltip}
                >
                    <span
                        className='input-clear-x'
                        aria-hidden='true'
                    >
                        <i className='icon icon-close-circle'/>
                    </span>
                </OverlayTrigger>
            </div>
        );

        const expiryTime = isStatusSet && customStatus?.expires_at && customStatus.duration !== CustomStatusDuration.DONT_CLEAR &&
            (
                <ExpiryTime
                    time={customStatus.expires_at}
                    timezone={this.props.timezone}
                    className={classNames('custom_status__expiry', {
                        padded: customStatus?.text.length > 0,
                    })}
                    withinBrackets={true}
                />
            );

        return (
            <Menu.Group>
                <Menu.ItemToggleModalRedux
                    ariaLabel={customStatusText || customStatusHelpText}
                    modalId={ModalIdentifiers.CUSTOM_STATUS}
                    dialogType={CustomStatusModal}

                    // IK: French or other longer language break responsive (ellipsis)
                    className={classNames('MenuItem__primary-text custom_status__row')}
                    id={'status-menu-custom-status'}
                >
                    <span className='custom_status__container'>
                        <span className='custom_status__icon'>
                            {customStatusEmoji}
                        </span>
                        <CustomStatusText

                            // IK: French or other longer language break responsive (ellipsis)
                            text={customStatusText || customStatusHelpText}
                            className='custom_status__text'
                        />
                        {clearButton}
                        {pulsatingDot}
                    </span>
                    {expiryTime}
                </Menu.ItemToggleModalRedux>
            </Menu.Group>
        );
    };

    render = (): JSX.Element => {
        const {intl, showNextSwitch} = this.props;
        const needsConfirm = this.isUserOutOfOffice() && this.props.autoResetPref === '';
        const {status, customStatus, isCustomStatusExpired, currentUser, showProfileTutorialStep, showStatusTutorialStep} = this.props;
        const isStatusSet = customStatus && (customStatus.text.length > 0 || customStatus.emoji.length > 0) && !isCustomStatusExpired;

        const setOnline = needsConfirm ? () => this.showStatusChangeConfirmation('online') : this.setOnline;
        const setDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setDnd;
        const setAway = needsConfirm ? () => this.showStatusChangeConfirmation('away') : this.setAway;
        const setOffline = needsConfirm ? () => this.showStatusChangeConfirmation('offline') : this.setOffline;
        const setCustomTimedDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setCustomTimedDnd;

        const redirectToManagerProfile = (): void => {
            window.open('https://manager.infomaniak.com/v3/ng/profile/user/dashboard', '_blank');
        };

        const selectedIndicator = (
            <CheckIcon
                size={16}
                color={'var(--button-bg)'}
            />
        );

        const dndSubMenuItems = ([
            {
                id: 'dndSubMenu-header',
                direction: 'right',
                text: this.props.intl.formatMessage({id: 'status_dropdown.dnd_sub_menu_header', defaultMessage: 'Disable notifications until:'}),
                isHeader: true,
            },
        ] as MenuType[])?.concat(
            this.dndTimes.map<MenuType>(({id, label}, index) => {
                let text: MenuType['text'] = this.props.intl.formatMessage(label);
                if (index === 3) {
                    const tomorrow = getCurrentMomentForTimezone(this.props.timezone).add(1, 'day').set({hour: 9, minute: 0}).toDate();
                    text = (
                        <>
                            {text}
                            <span className={`dndTime-${id}_timestamp`}>
                                <FormattedDate
                                    value={tomorrow}
                                    weekday='short'
                                    timeZone={this.props.timezone}
                                />
                                {', '}
                                <FormattedTime
                                    value={tomorrow}
                                    timeStyle='short'
                                    hour12={!this.props.isMilitaryTime}
                                    timeZone={this.props.timezone}
                                />
                            </span>
                        </>
                    );
                }
                return {
                    id: `dndTime-${id}`,
                    direction: 'right',
                    text,
                    action:
                        index === 4 ? () => setCustomTimedDnd() : () => setDnd(index),
                };
            }),
        );

        const customStatusComponent = this.renderCustomStatus(isStatusSet);

        let menuAriaLabeltext;
        switch (this.props.status) {
        case UserStatuses.AWAY:
            menuAriaLabeltext = intl.formatMessage({
                id: 'status_dropdown.profile_button_label.away',
                defaultMessage: 'Current status: Away. Select to open profile and status menu.',
            });
            break;
        case UserStatuses.DND:
            menuAriaLabeltext = intl.formatMessage({
                id: 'status_dropdown.profile_button_label.dnd',
                defaultMessage: 'Current status: Do not disturb. Select to open profile and status menu.',
            });
            break;
        case UserStatuses.OFFLINE:
            menuAriaLabeltext = intl.formatMessage({
                id: 'status_dropdown.profile_button_label.offline',
                defaultMessage: 'Current status: Offline. Select to open profile and status menu.',
            });
            break;
        case UserStatuses.ONLINE:
            menuAriaLabeltext = intl.formatMessage({
                id: 'status_dropdown.profile_button_label.online',
                defaultMessage: 'Current status: Online. Select to open profile and status menu.',
            });
            break;
        case UserStatuses.OUT_OF_OFFICE:
            menuAriaLabeltext = intl.formatMessage({
                id: 'status_dropdown.profile_button_label.ooo',
                defaultMessage: 'Current status: Out of office. Select to open profile and status menu.',
            });
            break;
        default:
            menuAriaLabeltext = intl.formatMessage({
                id: 'status_dropdown.profile_button_label',
                defaultMessage: 'Select to open profile and status menu.',
            });
        }

        const isNext = document.cookie.indexOf('KCHAT_NEXT=always') !== -1;

        return (
            <MenuWrapper
                onToggle={this.onToggle}
                open={this.props.isStatusDropdownOpen}
                className={classNames('status-dropdown-menu status-dropdown-menu-global-header', {
                    active: this.props.isStatusDropdownOpen || isStatusSet,
                })}
            >
                <button
                    className='status-wrapper style--none'
                    aria-label={menuAriaLabeltext}
                    aria-expanded={this.props.isStatusDropdownOpen}
                    aria-controls='statusDropdownMenu'
                >
                    <CustomStatusEmoji
                        showTooltip={true}
                        tooltipDirection={'bottom'}
                        emojiStyle={{marginRight: '6px'}}
                        onClick={this.handleCustomStatusEmojiClick as () => void}
                    />
                    {this.renderProfilePicture('sm')}
                    <div
                        className='status'
                    >
                        <StatusIcon
                            size={'sm'}
                            status={(this.props.status || 'offline') as TUserStatus}
                        />
                    </div>
                </button>
                <Menu
                    ariaLabel={this.props.intl.formatMessage({id: 'status_dropdown.menuAriaLabel', defaultMessage: 'Set a status'})}
                    id={'statusDropdownMenu'}
                    listId={'status-drop-down-menu-list'}
                >
                    {currentUser && (
                        <Menu.Header >
                            {this.renderProfilePicture('lg')}
                            <div className={'username-wrapper'}>
                                <Text
                                    className={'bold'}
                                    margin={'none'}
                                >{`${currentUser.first_name} ${currentUser.last_name}`}</Text>
                                <Text
                                    margin={'none'}
                                    className={!currentUser.first_name && !currentUser.last_name ? 'bold' : 'contrast'}
                                    color={!currentUser.first_name && !currentUser.last_name ? undefined : 'inherit'}
                                >
                                    {'@' + currentUser.username}
                                </Text>
                            </div>
                        </Menu.Header>
                    )}
                    <Menu.Group>
                        <Menu.ItemAction
                            show={this.isUserOutOfOffice()}
                            onClick={() => null}
                            ariaLabel={this.props.intl.formatMessage(statusDropdownMessages.ooo.name)}
                            text={this.props.intl.formatMessage(statusDropdownMessages.ooo.name)}
                            extraText={this.props.intl.formatMessage(statusDropdownMessages.ooo.extra)}
                        />
                    </Menu.Group>
                    {customStatusComponent}
                    <Menu.Group>
                        <Menu.ItemAction
                            onClick={setOnline}
                            ariaLabel={this.props.intl.formatMessage(statusDropdownMessages.online.name)}
                            text={this.props.intl.formatMessage(statusDropdownMessages.online.name)}
                            icon={(
                                <StatusIcon
                                    status={'online'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'online' && selectedIndicator}
                            id={'status-menu-online'}
                            sibling={showStatusTutorialStep && <StatusTour/>}
                        />
                        <Menu.ItemAction
                            onClick={setAway}
                            ariaLabel={this.props.intl.formatMessage(statusDropdownMessages.away.name)}
                            text={this.props.intl.formatMessage(statusDropdownMessages.away.name)}
                            icon={(
                                <StatusIcon
                                    status={'away'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'away' && selectedIndicator}
                            id={'status-menu-away'}
                        />
                        <Menu.ItemSubMenu
                            subMenu={dndSubMenuItems}
                            ariaLabel={`${this.props.intl.formatMessage(statusDropdownMessages.dnd.name)}. ${this.props.intl.formatMessage(statusDropdownMessages.dnd.extra)}`}
                            text={this.props.intl.formatMessage(statusDropdownMessages.dnd.name)}
                            extraText={this.props.intl.formatMessage(statusDropdownMessages.dnd.extra)}
                            icon={(
                                <StatusIcon
                                    status={'dnd'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'dnd' && selectedIndicator}
                            direction={'left'}
                            openUp={this.state.openUp}
                            id={'status-menu-dnd'}
                        />
                        <Menu.ItemAction
                            onClick={setOffline}
                            ariaLabel={this.props.intl.formatMessage(statusDropdownMessages.offline.name)}
                            text={this.props.intl.formatMessage(statusDropdownMessages.offline.name)}
                            icon={(
                                <StatusIcon
                                    status={'offline'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'offline' && selectedIndicator}
                            id={'status-menu-offline'}
                        />
                    </Menu.Group>
                    <Menu.Group>
                        <Menu.ItemAction
                            id='accountSettings'
                            ariaLabel='Profile'
                            modalId={ModalIdentifiers.USER_SETTINGS}
                            onClick={redirectToManagerProfile}

                            // dialogProps={{isContentProductSettings: false}}
                            text={this.props.intl.formatMessage({id: 'navbar_dropdown.profileSettings', defaultMessage: 'Profile'})}
                            icon={
                                <AccountOutlineIcon
                                    size={16}
                                    color={'rgba(var(--center-channel-color-rgb), 0.56)'}
                                    className={'profile__icon'}
                                />
                            }
                            sibling={showProfileTutorialStep && <ProfileTour/>}
                        >
                            {this.props.showCompleteYourProfileTour && (
                                <div
                                    onClick={this.handleCompleteYourProfileTask}
                                    className={'account-settings-complete'}
                                >
                                    <CompleteYourProfileTour/>
                                </div>
                            )}
                        </Menu.ItemAction>
                        {showNextSwitch &&
                            <Menu.ItemToggleModalRedux
                                className='status-dropdown-menu__next-switch'
                                modalId={ModalIdentifiers.TOGGLE_NEXT}
                                dialogType={ToggleNextModal}
                                icon={(
                                    <Icon
                                        size={16}
                                        glyph={'laptop'}
                                        className='status-dropdown-menu__next-icon'
                                    />
                                )}
                                text={(
                                    <div>
                                        <FormattedMessage
                                            id='toggle_next_modal.title'
                                            defaultMessage='Switch to {version} version'
                                            values={{
                                                version: isNext ? 'STABLE' : 'NEXT',
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        }
                    </Menu.Group>
                    <Menu.Group>
                        <span className={'logout__icon'}>
                            <Menu.ItemAction
                                id='logout'
                                onClick={this.handleEmitUserLoggedOutEvent}
                                text={this.props.intl.formatMessage({id: 'navbar_dropdown.logout', defaultMessage: 'Log Out'})}
                                icon={
                                    <ExitToAppIcon
                                        size={16}
                                        color={'rgba(var(--center-channel-color-rgb), 0.56)'}
                                    />
                                }
                            />
                        </span>
                    </Menu.Group>
                </Menu>
            </MenuWrapper>
        );
    };
}
export default injectIntl(StatusDropdown);
