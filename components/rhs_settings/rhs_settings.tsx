// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
/* eslint-disable react/no-string-refs */

import {defineMessages, useIntl} from 'react-intl';

import {Tab, Tabs} from 'react-bootstrap';

import {t} from '../../utils/i18n';

import {UserProfile} from '@mattermost/types/users';

import * as Utils from '../../utils/utils';

import NotificationsTab from 'components/rhs_settings/rhs_settings_notifications';

import AdvancedTab from 'components/rhs_settings/rhs_settings_advanced';

import DisplayTab from 'components/rhs_settings/rhs_settings_display';

import DraftTab from 'components/rhs_settings/rhs_settings_drafts';

import './rhs_settings.scss';
import RhsSettingsHeader from 'components/rhs_settings/rhs_settings_header/rhs_settings_header';

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
    shortcuts: {
        id: t('user.settings.advance.shortcuts'),
        defaultMessage: 'Shortcuts',
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
    settingsTab: string;
}

export default function RhsSettings({
    isMobile,
    currentUser,
    settingsTab,
}: Props) {
    const intl = useIntl();
    const tabs = [];
    tabs.push({name: 'display', uiName: intl.formatMessage(holders.display), icon: 'icon fa fa-eye', iconTitle: Utils.localizeMessage('user.settings.display.icon', 'Display Settings Icon')});
    tabs.push({name: 'notifications', uiName: intl.formatMessage(holders.notifications), icon: 'icon fa fa-exclamation-circle', iconTitle: Utils.localizeMessage('user.settings.notifications.icon', 'Notification Settings Icon')});
    tabs.push({name: 'shortcuts', uiName: intl.formatMessage(holders.shortcuts), icon: 'icon fa fa-list-alt', iconTitle: Utils.localizeMessage('user.settings.advance.icon', 'Shortcut Settings Icon')});
    tabs.push({name: 'drafts', uiName: intl.formatMessage(holders.advanced), icon: 'icon fa fa-list-alt', iconTitle: Utils.localizeMessage('user.settings.advance.icon', 'Advanced Settings Icon')});
    const [activeTab, setActiveTab] = React.useState(settingsTab || tabs[0].name);

    const handleUpdateActiveTab = (e) => {
        setActiveTab(e);
    };

    // Called to hide the settings pane when on mobile
    // const handleCollapse = () => {
    //     const el = ReactDOM.findDOMNode(this.modalBodyRef.current) as HTMLDivElement;
    //     el.closest('.modal-dialog')!.classList.remove('display--content');

    //     this.setState({
    //         active_tab: '',
    //         active_section: '',
    //     });
    // };

    const updateSection = (section?: string) => {
    };

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
                        id='settingsTabs'
                    >
                        {tabs && tabs.map((tab, i) => (
                            <Tab
                                key={i}
                                eventKey={tab.name}
                                title={tab.uiName}
                            />
                        ))}
                    </Tabs>
                    {activeTab === 'notifications' && (
                        <div>
                            <NotificationsTab
                                user={currentUser}
                                updateSection={updateSection}
                            />
                        </div>
                    )}
                    {activeTab === 'display' && (
                        <div>
                            <DisplayTab
                                user={currentUser}
                                updateSection={updateSection}
                            />
                        </div>
                    )}
                    {activeTab === 'shortcuts' && (
                        <div>
                            <AdvancedTab
                                updateSection={updateSection}
                            />
                        </div>
                    )}
                    {activeTab === 'drafts' && (
                        <div>
                            <DraftTab
                                user={currentUser}
                                updateSection={updateSection}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

