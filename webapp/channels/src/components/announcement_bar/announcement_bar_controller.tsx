// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ClientLicense, ClientConfig, WarnMetricStatus} from '@mattermost/types/config';

import withGetCloudSubscription from 'components/common/hocs/cloud/with_get_cloud_subscription';

import AppStoreBar from './appstore_announcement_bar';
import CloudTrialAnnouncementBar from './cloud_trial_announcement_bar';
import ConfigurationAnnouncementBar from './configuration_bar';
import AnnouncementBar from './default_announcement_bar';
import MASMigrationBar from './mas_migration_bar';
import NotificationPermissionBar from './notification_permission_bar';
import OverageUsersBanner from './overage_users_banner';
import TextDismissableBar from './text_dismissable_bar';
import UsersLimitsAnnouncementBar from './users_limits_announcement_bar';
import VersionBar from './version_bar';

// import CloudTrialEndAnnouncementBar from './cloud_trial_ended_announcement_bar';

type Props = {
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
            errorBar = (
                <AnnouncementBar
                    type={this.props.latestError.error.type}
                    message={this.props.latestError.error.message}
                    showCloseButton={true}
                    handleClose={this.props.actions.dismissError}
                />
            );
        }

        const paymentAnnouncementBar = null;
        const cloudTrialAnnouncementBar = null;
        const cloudTrialEndAnnouncementBar = null;
        const notifyAdminDowngradeDelinquencyBar = null;
        const toYearlyNudgeBannerDismissable = null;
        let toPaidPlanNudgeBannerDismissable = null;
        if (this.props.license?.Cloud === 'true') {
            // paymentAnnouncementBar = (
            //     <PaymentAnnouncementBar/>
            // );
            // cloudTrialAnnouncementBar = (
            //     <CloudTrialAnnouncementBar/>
            // );
            // cloudTrialEndAnnouncementBar = (
            //     <CloudTrialEndAnnouncementBar/>
            // );

            toPaidPlanNudgeBannerDismissable = (<ToPaidPlanBannerDismissable/>);
        }

        const autoStartTrialModal = null;

        // if (this.props.userIsAdmin) {
        //     autoStartTrialModal = (
        //         <AutoStartTrialModal/>
        //     );
        // }

        // The component specified further down takes priority over the component above it.
        // For example, consider this-
        // {
        //    Foo
        //    Bar
        //    Baz
        // }
        // Even if all Foo, Bar and Baz render, only Baz is visible as it's further down.
        // One exception to this rule is for admin configured announcement banners
        // If set with class 'admin-announcement', they will always be visible, stacked vertically.
        return (
            <>
                <NotificationPermissionBar/>
                {adminConfiguredAnnouncementBar}
                {errorBar}
                <UsersLimitsAnnouncementBar
                    license={this.props.license}
                    userIsAdmin={this.props.userIsAdmin}
                />
                {paymentAnnouncementBar}
                {cloudTrialAnnouncementBar}
                {cloudTrialEndAnnouncementBar}
                {notifyAdminDowngradeDelinquencyBar}
                {toYearlyNudgeBannerDismissable}
                {toPaidPlanNudgeBannerDismissable}
                {this.props.license?.Cloud !== 'true' && <OverageUsersBanner/>}
                {autoStartTrialModal}
                <VersionBar/>
                <AppStoreBar/>
                <MASMigrationBar/>
            </>
        );
    }
}

export default withGetCloudSubscription(AnnouncementBarController);
