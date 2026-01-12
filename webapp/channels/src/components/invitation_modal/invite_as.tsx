// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import RadioGroup from 'components/common/radio_group';

import {CloudProducts} from 'utils/constants';

import type {GlobalState} from 'types/store';
import './invite_as.scss';

export const InviteType = {
    MEMBER: 'MEMBER',
    GUEST: 'GUEST',
} as const;

export type InviteType = typeof InviteType[keyof typeof InviteType];

export type Props = {
    setInviteAs: (inviteType: InviteType) => void;
    inviteType: InviteType;
    titleClass?: string;
}

export default function InviteAs(props: Props) {
    const license = useSelector(getLicense);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPrevTrialLicense());
    }, []);

    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);
    const config = useSelector(getConfig);

    const isCloudStarter = subscriptionProduct?.sku === CloudProducts.STARTER;
    const isEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const isSelfHostedStarter = isEnterpriseReady && license.IsLicensed === 'false';
    const isStarter = isCloudStarter || isSelfHostedStarter;

    let extraGuestLegend = true;
    let guestDisabledClass = '';
    let badges = null;
    let guestDisabled = null;

    const isCloudFreeTrial = subscription?.is_free_trial === 'true';
    const isSelfHostedTrial = license.IsTrial === 'true';
    const isFreeTrial = isCloudFreeTrial || isSelfHostedTrial;

    const isPaidSubscription = !isStarter && !isFreeTrial;

    // show the badge logic (the restricted indicator takes care of the look when it is trial or not)
    if (isSystemAdmin && !isPaidSubscription) {
        const restrictedIndicator = '';

        guestDisabledClass = isFreeTrial ? '' : 'disabled-legend';
        badges = {
            matchVal: InviteType.GUEST as string,
            badgeContent: restrictedIndicator,
            extraClass: 'Tag__restricted-indicator-badge',
        };
        extraGuestLegend = false;
    }

    // disable the radio button logic (is disabled when is starter - pre and post trial)
    if (isStarter) {
        guestDisabled = (id: string) => {
            return (id === InviteType.GUEST);
        };
    }

    return (
        <div className='InviteAs'>
            <div className={props.titleClass}>
                <FormattedMessage
                    id='invite_modal.as'
                    defaultMessage='Invite as'
                />
            </div>
            <div>
                <RadioGroup
                    onChange={(e) => props.setInviteAs(e.target.value as InviteType)}
                    value={props.inviteType}
                    id='invite-as'
                    values={[
                        {
                            key: (
                                <FormattedMessage
                                    id='invite_modal.choose_member'
                                    defaultMessage='Member'
                                />
                            ),
                            value: InviteType.MEMBER,
                            testId: 'inviteMembersLink',
                        },
                        {
                            key: (
                                <span className={`InviteAs__label ${guestDisabledClass}`}>
                                    <FormattedMessage
                                        id='invite_modal.choose_guest_a'
                                        defaultMessage='Guest'
                                    />
                                    {extraGuestLegend && <span className='InviteAs__label--parenthetical'>
                                        {' - '}
                                        <FormattedMessage
                                            id='invite_modal.choose_guest_b'
                                            defaultMessage='limited to select channels and teams'
                                        />
                                    </span>}
                                </span>
                            ),
                            value: InviteType.GUEST,
                            testId: 'inviteGuestLink',
                        },
                    ]}
                    isDisabled={guestDisabled}
                    badge={badges}
                />
            </div>
        </div>
    );
}
