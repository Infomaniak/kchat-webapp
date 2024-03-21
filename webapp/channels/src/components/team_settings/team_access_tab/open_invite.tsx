// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessages, useIntl} from 'react-intl';

import ExternalLink from 'components/external_link';
import BaseSettingItem from 'components/widgets/modals/components/base_setting_item';
import CheckboxSettingItem from 'components/widgets/modals/components/checkbox_setting_item';

type Props = {
    allowOpenInvite: boolean;
    isGroupConstrained?: boolean;
    setAllowOpenInvite: (value: boolean) => void;
};

const translations = defineMessages({
    OpenInviteText: {
        id: 'general_tab.openInviteText',
        defaultMessage: 'Users on this server',
    },
    OpenInviteDesc: {
        id: 'general_tab.openInviteDesc',
        defaultMessage: 'When enabled, a link to this team will be included on the landing page allowing anyone with an account to join this team. Changing this setting will create a new invitation link and invalidate the previous link.',
    },
    OpenInviteTitle: {
        id: 'general_tab.openInviteTitle',
        defaultMessage: 'Allow only users with a specific email domain to join this team',
    },
});

const OpenInvite = ({isGroupConstrained, allowOpenInvite, setAllowOpenInvite}: Props) => {
    const {formatMessage} = useIntl();
    if (isGroupConstrained) {
        const groupConstrainedContent = (
            <p id='groupConstrainedContent' >{
                formatMessage({
                    id: 'team_settings.openInviteDescription.groupConstrained',
                    defaultMessage: 'Members of this team are added and removed by linked groups. <link>Learn More</link>',
                }, {
                    link: (msg: React.ReactNode) => (
                        <ExternalLink
                            href='https://mattermost.com/pl/default-ldap-group-constrained-team-channel.html'
                            location='open_invite'
                        >
                            {msg}
                        </ExternalLink>
                    ),
                })}
            </p>
        );
        return (
            <BaseSettingItem
                className='access-invite-domains-section'
                title={translations.OpenInviteText}
                description={translations.OpenInviteDesc}
                descriptionAboveContent={true}
                content={groupConstrainedContent}
            />
        );
    }

    return (
        <CheckboxSettingItem
            className='access-invite-domains-section'
            inputFieldData={{title: translations.OpenInviteTitle, name: 'name'}}
            inputFieldValue={allowOpenInvite}
            handleChange={setAllowOpenInvite}
            title={translations.OpenInviteText}
            description={translations.OpenInviteDesc}
            descriptionAboveContent={true}
        />
    );
};

export default OpenInvite;
