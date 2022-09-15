// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
/* eslint-disable react/no-string-refs */

import {defineMessages, FormattedMessage, useIntl} from 'react-intl';

import styled from 'styled-components';

import {useDispatch, useSelector} from 'react-redux';

import {Tab, Tabs} from 'react-bootstrap';

import ReactDOM from 'react-dom';

import OverlayTrigger from '../overlay_trigger';
import Constants, {RHSStates} from '../../utils/constants';
import LocalizedIcon from '../localized_icon';
import {t} from '../../utils/i18n';

import Tooltip from '../tooltip';
import {UserProfile} from '@mattermost/types/users';

import {GlobalState} from '../../types/store';
import {getRhsState} from '../../selectors/rhs';
import {closeRightHandSide, showSettingss} from '../../actions/views/rhs';
import * as Utils from '../../utils/utils';
import GeneralTab from '../user_settings/general';
import SecurityTab from '../user_settings/security';
import NotificationsTab from '../user_settings/notifications';
import DisplayTab from './rhs_settings_display';

import './rhs_settings.scss';
import RhsSettingsHeader from './rhs_settings_header/rhs_settings_header';

const holders = defineMessages({
    profile: {
        id: t('user.settings.modal.profile'),
        defaultMessage: 'Profile',
    },
    security: {
        id: t('user.settings.modal.security'),
        defaultMessage: 'Security',
    },
    notifications: {
        id: t('user.settings.modal.notifications'),
        defaultMessage: 'Notifications',
    },
    display: {
        id: t('user.settings.modal.display'),
        defaultMessage: 'Display',
    },
    sidebar: {
        id: t('user.settings.modal.sidebar'),
        defaultMessage: 'Sidebar',
    },
    advanced: {
        id: t('user.settings.modal.advanced'),
        defaultMessage: 'Advanced',
    },
    checkEmail: {
        id: 'user.settings.general.checkEmail',
        defaultMessage: 'Check your email at {email} to verify the address. Cannot find the email?',
    },
    confirmTitle: {
        id: t('user.settings.modal.confirmTitle'),
        defaultMessage: 'Discard Changes?',
    },
    confirmMsg: {
        id: t('user.settings.modal.confirmMsg'),
        defaultMessage: 'You have unsaved changes, are you sure you want to discard them?',
    },
    confirmBtns: {
        id: t('user.settings.modal.confirmBtns'),
        defaultMessage: 'Yes, Discard',
    },
});

export interface Props {
    isMobile?: boolean;
    currentUser: UserProfile;
}
const Icon = styled.i`
    font-size:12px;
`;

const BackButton = styled.button`
    border: 0px;
    background: transparent;
`;

const HeaderTitle = styled.span`
    line-height: 2.4rem;
`;

export default function RhsSettings({
    isMobile,
    currentUser,
}: Props) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));
    const tabs = [];
    tabs.push({name: 'display', uiName: intl.formatMessage(holders.display), icon: 'icon fa fa-eye', iconTitle: Utils.localizeMessage('user.settings.display.icon', 'Display Settings Icon')});
    tabs.push({name: 'notifications', uiName: intl.formatMessage(holders.notifications), icon: 'icon fa fa-exclamation-circle', iconTitle: Utils.localizeMessage('user.settings.notifications.icon', 'Notification Settings Icon')});
    tabs.push({name: 'sidebar', uiName: intl.formatMessage(holders.sidebar), icon: 'icon fa fa-columns', iconTitle: Utils.localizeMessage('user.settings.sidebar.icon', 'Sidebar Settings Icon')});
    tabs.push({name: 'advanced', uiName: intl.formatMessage(holders.advanced), icon: 'icon fa fa-list-alt', iconTitle: Utils.localizeMessage('user.settings.advance.icon', 'Advanced Settings Icon')});
    const [activeTab, setActiveTab] = React.useState(tabs[0].name);

    console.log(currentUser);
    const onClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.SETTINGS) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showSettingss());
        }
    };

    const handleUpdateActiveTab = (e) => {
        setActiveTab(e);
    };

    // Called to hide the settings pane when on mobile
    const handleCollapse = () => {
        const el = ReactDOM.findDOMNode(this.modalBodyRef.current) as HTMLDivElement;
        el.closest('.modal-dialog')!.classList.remove('display--content');

        this.setState({
            active_tab: '',
            active_section: '',
        });
    };

    // TODO: check for remove
    const closeModal = () => {
        return false;
    };

    const collapseModal = () => {
        handleCollapse();
    };

    const updateSection = (section?: string, skipConfirm?: boolean) => {
        console.log(section);
    };

    const closeSidebarTooltip = (
        <Tooltip id='closeSidebarTooltip'>
            <FormattedMessage
                id='rhs_header.closeSidebarTooltip'
                defaultMessage='Close'
            />
        </Tooltip>
    );

    return (
        <div className='sidebar--right__content'>
            <div
                id='rhsContainer'
                className='sidebar-right__body'
            >
                <RhsSettingsHeader isMobile={isMobile}/>
                {/*    end of header  */}
                <div className='accountSettingRhs'>
                    <Tabs
                        defaultActiveKey={activeTab}
                        onSelect={handleUpdateActiveTab}
                        className='settings-tabs'
                    >
                        {tabs && tabs.map((tab, i) => (
                            <Tab
                                key={i}
                                eventKey={tab.name}
                                title={tab.uiName}
                            />
                        ))}
                    </Tabs>
                    {activeTab === 'profile' && (
                        <div>
                            {/*<GeneralTab*/}
                            {/*    user={currentUser}*/}
                            {/*    activeSection={this.props.activeSection}*/}
                            {/*    updateSection={this.props.updateSection}*/}
                            {/*    updateTab={handleUpdateActiveTab}*/}
                            {/*    closeModal={closeModal}*/}
                            {/*    collapseModal={collapseModal}*/}
                            {/*/>*/}
                        </div>
                    )}
                    {activeTab === 'security' && (
                        <div>
                            {/*<SecurityTab*/}
                            {/*    user={currentUser}*/}
                            {/*    activeSection={this.props.activeSection}*/}
                            {/*    updateSection={this.props.updateSection}*/}
                            {/*    closeModal={closeModal}*/}
                            {/*    collapseModal={collapseModal}*/}
                            {/*    setRequireConfirm={this.props.setRequireConfirm}*/}
                            {/*/>*/}
                        </div>

                    )}
                    {activeTab === 'notifications' && (
                        <div>
                            <NotificationsTab
                                user={currentUser}
                                updateSection={updateSection}
                                closeModal={closeModal}
                                collapseModal={collapseModal}
                            />
                        </div>
                    )}
                    {activeTab === 'display' && (
                        <div>
                            <DisplayTab
                                user={currentUser}
                                updateSection={updateSection}
                                closeModal={closeModal}
                                collapseModal={collapseModal}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

