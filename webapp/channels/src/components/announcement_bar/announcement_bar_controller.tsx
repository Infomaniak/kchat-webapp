// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';

import type {ClientLicense, ClientConfig, WarnMetricStatus} from '@mattermost/types/config';

import withGetCloudSubscription from 'components/common/hocs/cloud/with_get_cloud_subscription';

import AlmostFullStorageAnnouncementBar from './almost_full_storage_announcement_bar';
import AppStoreBar from './appstore_announcement_bar';
import AnnouncementBar from './default_announcement_bar';
import {FullStorageAnnouncementBar} from './full_storage_announcement_bar/full_storage_announcement_bar';
import GetAppAnnoucementBar from './get_app_announcement_bar';
import MASMigrationBar from './mas_migration_bar';
import NotificationPermissionBar from './notification_permission_bar';
import OverageUsersBanner from './overage_users_banner';
import TextDismissableBar from './text_dismissable_bar';
import UsersLimitsAnnouncementBar from './users_limits_announcement_bar';
import VersionBar from './version_bar';

// import CloudTrialEndAnnouncementBar from './cloud_trial_ended_announcement_bar';

type Props = {
    intl: IntlShape;
    license?: ClientLicense;
    config?: Partial<ClientConfig>;
    canViewSystemErrors: boolean;
    userIsAdmin: boolean;
    latestError?: {
        error: any;
    };
    warnMetricsStatus?: Record<string, WarnMetricStatus>;
    actions: {
        dismissError: (index: number) => void;
        getCloudSubscription: () => void;
        getCloudCustomer: () => void;
    };
};

class AnnouncementBarController extends React.PureComponent<Props> {
    render() {
        let adminConfiguredAnnouncementBar = null;
        if (this.props.config?.EnableBanner === 'true' && this.props.config.BannerText?.trim()) {
            adminConfiguredAnnouncementBar = (
                <TextDismissableBar
                    className='admin-announcement'
                    color={this.props.config.BannerColor}
                    textColor={this.props.config.BannerTextColor}
                    allowDismissal={this.props.config.AllowBannerDismissal === 'true'}
                    text={this.props.config.BannerText}
                />
            );
        }

        let errorBar = null;
        if (this.props.latestError) {
            // IK: to translate the red announcement bar javascript error
            const defaultMessage = this.props.latestError.error.message;
            const messageId = this.props.latestError.error.intlId;
            const message = messageId ? this.props.intl.formatMessage({id: messageId, defaultMessage}) : defaultMessage;

            errorBar = (
                <AnnouncementBar
                    type={this.props.latestError.error.type}
                    message={message}
                    showCloseButton={true}
                    handleClose={this.props.actions.dismissError}
                />
            );
        }

        return (
            <>
                <FullStorageAnnouncementBar userIsAdmin={this.props.userIsAdmin}/>
                <NotificationPermissionBar/>
                {adminConfiguredAnnouncementBar}
                {errorBar}
                <UsersLimitsAnnouncementBar
                    license={this.props.license}
                    userIsAdmin={this.props.userIsAdmin}
                />
                {this.props.license?.Cloud !== 'true' && <OverageUsersBanner/>}
                <VersionBar/>
                <AppStoreBar/>
                <GetAppAnnoucementBar/>
                <MASMigrationBar/>
                <AlmostFullStorageAnnouncementBar userIsAdmin={this.props.userIsAdmin}/>
            </>
        );
    }
}

export default withGetCloudSubscription(injectIntl(AnnouncementBarController));
