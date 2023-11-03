// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ErrorPageTypes} from 'utils/constants';
import {t} from 'utils/i18n';

import ErrorLink from './error_link';
import CloudArchived from './messages/cloud_archived';

type Props = {
    type?: string | null;
    message?: string;
    service?: string;
    isGuest?: boolean;
}

const ErrorMessage: React.FC<Props> = ({type, message, service, isGuest}: Props) => {
    let errorMessage = null;
    if (type) {
        switch (type) {
        case ErrorPageTypes.LOCAL_STORAGE:
            errorMessage = (
                <div>
                    <FormattedMessage
                        id='error.local_storage.message'
                        defaultMessage='kChat was unable to load because a setting in your browser prevents the use of its local storage features. To allow kChat to load, try the following actions:'
                    />
                    <ul>
                        <li>
                            <FormattedMessage
                                id='error.local_storage.help1'
                                defaultMessage='Enable cookies'
                            />
                        </li>
                        <li>
                            <FormattedMessage
                                id='error.local_storage.help2'
                                defaultMessage='Turn off private browsing'
                            />
                        </li>
                        <li>
                            <FormattedMessage
                                id='error.local_storage.help3'
                                defaultMessage='Use a supported browser (IE 11, Chrome 61+, Firefox 60+, Safari 12+, Edge 42+)'
                            />
                        </li>
                    </ul>
                </div>
            );
            break;
        case ErrorPageTypes.PERMALINK_NOT_FOUND:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='permalink.error.access'
                        defaultMessage='Permalink belongs to a deleted message or to a channel to which you do not have access.'
                    />
                </p>
            );
            break;
        case ErrorPageTypes.CLOUD_ARCHIVED:
            errorMessage = (
                <p>
                    <CloudArchived/>
                </p>
            );
            break;
        case ErrorPageTypes.TEAM_NOT_FOUND:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='error.team_not_found.message'
                        defaultMessage="The team you're requesting is private or does not exist."
                    />
                </p>
            );
            break;
        case ErrorPageTypes.CHANNEL_NOT_FOUND:
            errorMessage = (
                <p>
                    {isGuest ? (
                        <FormattedMessage
                            id='error.channel_not_found.message_guest'
                            defaultMessage='Your guest account has no channels assigned. Please contact an administrator.'
                        />
                    ) : (
                        <FormattedMessage
                            id='error.channel_not_found.message'
                            defaultMessage="The channel you're requesting is private or does not exist. Please contact an Administrator to be added to the channel."
                        />

                    )}
                </p>
            );
            break;
        case ErrorPageTypes.OAUTH_MISSING_CODE:
            errorMessage = (
                <div>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code'
                            defaultMessage='The service provider {service} did not provide an authorization code in the redirect URL.'
                            values={{
                                service,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.google'
                            defaultMessage='For {link} make sure your administrator enabled the Google+ API.'
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://docs.mattermost.com/deployment/sso-google.html'}
                                        messageId={t('error.oauth_missing_code.google.link')}
                                        defaultMessage={'Google Apps'}
                                    />
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.office365'
                            defaultMessage='For {link} make sure the administrator of your Microsoft organization has enabled the kChat app.'
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://docs.mattermost.com/deployment/sso-office.html'}
                                        messageId={t('error.oauth_missing_code.office365.link')}
                                        defaultMessage={'Office 365'}
                                    />
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.gitlab'
                            defaultMessage='For {link} please make sure you followed the setup instructions.'
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://docs.mattermost.com/deployment/sso-gitlab.html'}
                                        messageId={t('error.oauth_missing_code.gitlab.link')}
                                        defaultMessage={'GitLab'}
                                    />
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='error.oauth_missing_code.forum'
                            defaultMessage="If you reviewed the above and are still having trouble with configuration, you may post in our {link} where we'll be happy to help with issues during setup."
                            values={{
                                link: (
                                    <ErrorLink
                                        url={'https://forum.mattermost.com/c/trouble-shoot'}
                                        messageId={t('error.oauth_missing_code.forum.link')}
                                        defaultMessage={'Troubleshooting forum'}
                                    />
                                ),
                            }}
                        />
                    </p>
                </div>
            );
            break;
        case ErrorPageTypes.OAUTH_ACCESS_DENIED:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='error.oauth_access_denied'
                        defaultMessage='You must authorize kChat to log in with {service}.'
                        values={{
                            service,
                        }}
                    />
                </p>
            );
            break;
        case ErrorPageTypes.OAUTH_INVALID_REDIRECT_URL:
        case ErrorPageTypes.OAUTH_INVALID_PARAM:
            errorMessage = (
                <p>
                    {message}
                </p>
            );
            break;
        case ErrorPageTypes.NO_KSUITE:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='error.no_team.message'
                        defaultMessage='kSuite integrates all our productivity applications including kChat to communicate live, share and coordinate your teams.'
                    />
                </p>
            );
            break;
        case ErrorPageTypes.MAINTENANCE:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='error.maintenance.message'
                        defaultMessage='An update is in progress to improve kChat. This process may take a few minutes. Thank you for your patience.'
                    />
                </p>
            );
            break;
        case ErrorPageTypes.BLOCKED:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='error.blocked.message'
                        defaultMessage='The kSuite product has expired. Please renew it to continue communicating within your organization with kChat.'
                    />
                </p>
            );
            break;
        case ErrorPageTypes.PAGE_NOT_FOUND:
        default:
            errorMessage = (
                <p>
                    <FormattedMessage
                        id='error.not_found.message'
                        defaultMessage='Ce lien n’a peut-être jamais existé. Si ce lien existe, veuillez contacter la personne qui vous a partagé ce lien afin qu’elle vous donne les droits d’accès.'
                    />
                </p>
            );
        }
    } else if (message) {
        errorMessage = (
            <p>
                {message}
            </p>
        );
    } else {
        errorMessage = (
            <p>
                <FormattedMessage
                    id='error.generic.message'
                    defaultMessage='Veuillez réessayer ultérieurement ou essayer de rafraîchir la page. Si le problème persiste, veuillez contacter le support.'
                />
            </p>
        );
    }

    return errorMessage;
};

export default ErrorMessage;
