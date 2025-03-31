// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Icon from '@infomaniak/compass-components/foundations/icon';
import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';

import type {UserProfile} from '@mattermost/types/users';

import {Permissions} from 'mattermost-redux/constants';

import AboutBuildModal from 'components/about_build_modal';
import {VisitSystemConsoleTour} from 'components/onboarding_tasks';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import MarketplaceModal from 'components/plugin_marketplace';
import UserGroupsModal from 'components/user_groups_modal';
import Menu from 'components/widgets/menu/menu';

import {ModalIdentifiers} from 'utils/constants';
import {makeUrlSafe} from 'utils/url';
import * as UserAgent from 'utils/user_agent';

import type {ModalData} from 'types/actions';

import './product_menu_list.scss';

export type Props = {
    isMobile: boolean;
    teamId?: string;
    teamName?: string;
    siteName: string;
    currentUser: UserProfile;
    appDownloadLink: string;
    isMessaging: boolean;
    enableCommands: boolean;
    enableIncomingWebhooks: boolean;
    enableOAuthServiceProvider: boolean;
    enableOutgoingWebhooks: boolean;
    canManageSystemBots: boolean;
    canManageIntegrations: boolean;
    enablePluginMarketplace: boolean;
    showVisitSystemConsoleTour: boolean;
    isStarterFree: boolean;
    isFreeTrial: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
    handleVisitConsoleClick: React.MouseEventHandler<HTMLElement>;
    enableCustomUserGroups?: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        getPrevTrialLicense: () => void;
    };
};

const ProductMenuList = (props: Props): JSX.Element | null => {
    const {
        teamId,
        teamName,
        siteName,
        currentUser,
        appDownloadLink,
        isMessaging,
        enableCommands,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
        canManageSystemBots,
        canManageIntegrations,
        enablePluginMarketplace,
        showVisitSystemConsoleTour,
        isStarterFree,
        isFreeTrial,
        onClick,
        handleVisitConsoleClick,
        isMobile = false,
        enableCustomUserGroups,
    } = props;
    const {formatMessage} = useIntl();

    useEffect(() => {
        props.actions.getPrevTrialLicense();
    }, []);

    if (!currentUser) {
        return null;
    }

    const openGroupsModal = () => {
        props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS,
            dialogType: UserGroupsModal,
            dialogProps: {
                backButtonAction: openGroupsModal,
            },
        });
    };

    const someIntegrationEnabled = enableIncomingWebhooks || enableOutgoingWebhooks || enableCommands || enableOAuthServiceProvider || canManageSystemBots;
    const showIntegrations = !isMobile && someIntegrationEnabled && canManageIntegrations;

    return (
        <Menu.Group>
            <div onClick={onClick}>
                <SystemPermissionGate permissions={Permissions.SYSCONSOLE_READ_PERMISSIONS}>
                    <Menu.ItemLink
                        id='systemConsole'
                        show={!isMobile}
                        to='/admin_console'
                        text={(
                            <>
                                {formatMessage({id: 'navbar_dropdown.console', defaultMessage: 'System Console'})}
                                {showVisitSystemConsoleTour && (
                                    <div
                                        onClick={handleVisitConsoleClick}
                                        className={'system-console-visit'}
                                    >
                                        <VisitSystemConsoleTour/>
                                    </div>
                                )}
                            </>
                        )}
                        icon={
                            <Icon
                                size={16}
                                glyph={'application-cog'}
                            />
                        }
                    />
                </SystemPermissionGate>
                <Menu.ItemLink
                    id='integrations'
                    show={isMessaging && showIntegrations}
                    to={'/' + teamName + '/integrations'}
                    text={formatMessage({id: 'navbar_dropdown.integrations', defaultMessage: 'Integrations'})}
                    icon={
                        <Icon
                            size={16}
                            glyph={'webhook-incoming'}
                        />
                    }
                />
                <Menu.ItemToggleModalRedux
                    id='userGroups'
                    modalId={ModalIdentifiers.USER_GROUPS}
                    show={enableCustomUserGroups || isStarterFree || isFreeTrial}
                    dialogType={UserGroupsModal}
                    dialogProps={{
                        backButtonAction: openGroupsModal,
                    }}
                    text={formatMessage({id: 'navbar_dropdown.userGroups', defaultMessage: 'User Groups'})}
                    icon={
                        <Icon
                            size={16}
                            glyph={'account-multiple-outline'}
                        />
                    }
                    disabled={isStarterFree}
                />
                <TeamPermissionGate
                    teamId={teamId}
                    permissions={[Permissions.SYSCONSOLE_WRITE_PLUGINS]}
                >
                    <Menu.ItemToggleModalRedux
                        id='marketplaceModal'
                        modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                        show={isMessaging && !isMobile && enablePluginMarketplace}
                        dialogType={MarketplaceModal}
                        text={formatMessage({id: 'navbar_dropdown.marketplace', defaultMessage: 'Marketplace'})}
                        icon={
                            <Icon
                                size={16}
                                glyph={'apps'}
                            />
                        }
                    />
                </TeamPermissionGate>
                <Menu.ItemExternalLink
                    id='nativeAppLink'
                    show={appDownloadLink && !UserAgent.isMobileApp()}
                    url={makeUrlSafe(appDownloadLink)}
                    text={formatMessage({id: 'navbar_dropdown.nativeApps', defaultMessage: 'Download Apps'})}
                    icon={
                        <Icon
                            size={16}
                            glyph={'download-outline'}
                        />
                    }
                />
                <Menu.ItemToggleModalRedux
                    id='about'
                    modalId={ModalIdentifiers.ABOUT}
                    dialogType={AboutBuildModal}
                    text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: siteName})}
                    icon={
                        <Icon
                            size={16}
                            glyph={'information-outline'}
                        />
                    }
                />
            </div>
        </Menu.Group>
    );
};

export default ProductMenuList;
