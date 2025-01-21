// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ShowNotificationMessageKey} from '@infomaniak/ksuite-bridge';

import {logError} from 'mattermost-redux/actions/errors';
import {getProfilesByIds} from 'mattermost-redux/actions/users';
import {getCurrentChannel, getMyChannelMember, makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getKSuiteBridge, getKSuiteDnd} from 'mattermost-redux/selectors/entities/ksuiteBridge';
import {
    getTeammateNameDisplaySetting,
    isCollapsedThreadsEnabled,
} from 'mattermost-redux/selectors/entities/preferences';
import {getAllUserMentionKeys} from 'mattermost-redux/selectors/entities/search';
import {getCurrentUserId, getCurrentUser, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {isSystemMessage, isUserAddedInChannel} from 'mattermost-redux/utils/post_utils';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {getChannelURL, getPermalinkURL} from 'selectors/urls';
import {isThreadOpen} from 'selectors/views/threads';

import {getHistory} from 'utils/browser_history';
import Constants, {NotificationLevels, UserStatuses, IgnoreChannelMentions} from 'utils/constants';
import DesktopApp from 'utils/desktop_api';
import {t} from 'utils/i18n';
import {stripMarkdown, formatWithRenderer} from 'utils/markdown';
import MentionableRenderer from 'utils/markdown/mentionable_renderer';
import * as NotificationSounds from 'utils/notification_sounds';
import {showNotification} from 'utils/notifications';
import {cjkrPattern, escapeRegex} from 'utils/text_formatting';
import {isDesktopApp, isMobileApp, isWindowsApp} from 'utils/user_agent';
import * as Utils from 'utils/utils';

import icon50 from 'images/icon50x50.png';

import {runDesktopNotificationHooks} from './hooks';

const NOTIFY_TEXT_MAX_LENGTH = 50;

// windows notification length is based windows chrome which supports 128 characters and is the lowest length of windows browsers
const WINDOWS_NOTIFY_TEXT_MAX_LENGTH = 120;

const getSoundFromChannelMemberAndUser = (member, user) => {
    if (member?.notify_props?.desktop_sound) {
        return member.notify_props.desktop_sound === 'on';
    }

    return !user.notify_props || user.notify_props.desktop_sound === 'true';
};

const getNotificationSoundFromChannelMemberAndUser = (member, user) => {
    if (member?.notify_props?.desktop_notification_sound) {
        return member.notify_props.desktop_notification_sound;
    }

    return user.notify_props?.desktop_notification_sound ? user.notify_props.desktop_notification_sound : 'Bing';
};

/**
 * @returns {import('mattermost-redux/types/actions').ThunkActionFunc<void>}
 */
export function sendDesktopNotification(post, msgProps) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const bridge = getKSuiteBridge(state);

        if ((currentUserId === post.user_id && post.props.from_webhook !== 'true')) {
            return;
        }

        if (isSystemMessage(post) && !isUserAddedInChannel(post, currentUserId)) {
            return;
        }

        let userFromPost = getUser(state, post.user_id);
        if (!userFromPost) {
            const missingProfileResponse = await dispatch(getProfilesByIds([post.user_id]));
            if (missingProfileResponse.data && missingProfileResponse.data.length) {
                userFromPost = missingProfileResponse.data[0];
            }
        }

        let mentions = [];
        if (msgProps.mentions) {
            mentions = msgProps.mentions;
        }

        let followers = [];
        if (msgProps.followers) {
            followers = msgProps.followers;
            mentions = [...new Set([...followers, ...mentions])];
        }

        const teamId = msgProps.team_id;

        let channel = makeGetChannel()(state, {id: post.channel_id});
        const user = getCurrentUser(state);
        const userStatus = getStatusForUserId(state, user.id);
        const member = getMyChannelMember(state, post.channel_id);
        const isCrtReply = isCollapsedThreadsEnabled(state) && post.root_id !== '';
        const ksuiteDnd = getKSuiteDnd(state);

        if (!member || isChannelMuted(member) || userStatus === UserStatuses.DND || userStatus === UserStatuses.OUT_OF_OFFICE) {
            return;
        }

        const channelNotifyProp = member?.notify_props?.desktop || NotificationLevels.DEFAULT;
        let notifyLevel = channelNotifyProp;

        if (notifyLevel === NotificationLevels.DEFAULT) {
            notifyLevel = user?.notify_props?.desktop || NotificationLevels.ALL;
        }

        if (channel.type === 'G' && channelNotifyProp === NotificationLevels.DEFAULT && user?.notify_props?.desktop === NotificationLevels.MENTION) {
            notifyLevel = NotificationLevels.ALL;
        }

        if (ksuiteDnd || window.location.search.includes('dnd=true') || notifyLevel === NotificationLevels.NONE) {
            return;
        } else if (channel.type === 'G' && notifyLevel === NotificationLevels.MENTION) {
            // Compose the whole text in the message, including interactive messages.
            let text = post.message;

            // We do this on a try catch block to avoid errors from malformed props
            try {
                if (post.props && post.props.attachments && post.props.attachments.length > 0) {
                    const attachments = post.props.attachments;
                    function appendText(toAppend) {
                        if (toAppend) {
                            text += `\n${toAppend}`;
                        }
                    }
                    for (const attachment of attachments) {
                        appendText(attachment.pretext);
                        appendText(attachment.title);
                        appendText(attachment.text);
                        appendText(attachment.footer);
                        if (attachment.fields) {
                            for (const field of attachment.fields) {
                                appendText(field.title);
                                appendText(field.value);
                            }
                        }
                    }
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log('Could not process the whole attachment for mentions', e);
            }

            const allMentions = getAllUserMentionKeys(state);

            const ignoreChannelMentionProp = member?.notify_props?.ignore_channel_mentions || IgnoreChannelMentions.DEFAULT;
            let ignoreChannelMention = ignoreChannelMentionProp === IgnoreChannelMentions.ON;
            if (ignoreChannelMentionProp === IgnoreChannelMentions.DEFAULT) {
                ignoreChannelMention = user?.notify_props?.channel === 'false';
            }

            const mentionableText = formatWithRenderer(text, new MentionableRenderer());
            let isExplicitlyMentioned = false;
            for (const mention of allMentions) {
                if (!mention || !mention.key) {
                    continue;
                }

                if (ignoreChannelMention && ['@all', '@here', '@channel'].includes(mention.key)) {
                    continue;
                }

                let flags = 'g';
                if (!mention.caseSensitive) {
                    flags += 'i';
                }

                let pattern;
                if (cjkrPattern.test(mention.key)) {
                    // In the case of CJK mention key, even if there's no delimiters (such as spaces) at both ends of a word, it is recognized as a mention key
                    pattern = new RegExp(`()(${escapeRegex(mention.key)})()`, flags);
                } else {
                    pattern = new RegExp(
                        `(^|\\W)(${escapeRegex(mention.key)})(\\b|_+\\b)`,
                        flags,
                    );
                }

                if (pattern.test(mentionableText)) {
                    isExplicitlyMentioned = true;
                    break;
                }
            }

            if (!isExplicitlyMentioned) {
                return;
            }
        } else if (notifyLevel === NotificationLevels.MENTION && mentions.indexOf(user.id) === -1 && msgProps.channel_type !== Constants.DM_CHANNEL) {
            return;
        } else if (isCrtReply && notifyLevel === NotificationLevels.ALL && followers.indexOf(currentUserId) === -1) {
            // if user is not following the thread don't notify
            return;
        }

        const config = getConfig(state);
        let username = '';
        if (post.props.override_username && config.EnablePostUsernameOverride === 'true') {
            username = post.props.override_username;
        } else if (userFromPost) {
            username = displayUsername(userFromPost, getTeammateNameDisplaySetting(state), false);
        } else {
            username = Utils.localizeMessage('channel_loader.someone', 'Someone');
        }

        let title = Utils.localizeMessage('channel_loader.posted', 'Posted');
        if (!channel) {
            title = msgProps.channel_display_name;
            channel = {
                name: msgProps.channel_name,
                type: msgProps.channel_type,
            };
        } else if (channel.type === Constants.DM_CHANNEL) {
            title = Utils.localizeMessage('notification.dm', 'Direct Message');
        } else {
            title = channel.display_name;
        }

        if (title === '') {
            if (msgProps.channel_type === Constants.DM_CHANNEL) {
                title = Utils.localizeMessage('notification.dm', 'Direct Message');
            } else {
                title = msgProps.channel_display_name;
            }
        }

        if (isCrtReply) {
            title = Utils.localizeAndFormatMessage(t('notification.crt'), 'Reply in {title}', {title});
        }

        let notifyText = post.message;

        // If the post has attachments, add their text to the notification message
        if (post.props && post.props.attachments && post.props.attachments.length > 0) {
            const attachments = post.props.attachments;

            // Collect the text from each attachment
            const attachmentTexts = attachments.map((attachment) => {
                return [
                    attachment.pretext, // Add pretext to give context to the attachment
                    attachment.title, // Title of the attachment
                    attachment.text, // Main text of the attachment
                    attachment.footer, // Footer text, if any
                    attachment.fields ? attachment.fields.map((field) => `${field.title}: ${field.value}`).join(', ') : '', // If there are fields, add them
                    attachment.image_url ? '[Image Attached]' : '', // Add '[Image Attached]' if there is an image URL
                ].filter(Boolean).join(' ');
            }).join('\n');

            // Add the collected text to the notification message
            notifyText = notifyText ? `${notifyText}\n${attachmentTexts}` : attachmentTexts;
        }

        const msgPropsPost = msgProps.post;
        const attachments = msgPropsPost && msgPropsPost.props && msgPropsPost.props.attachments ? msgPropsPost.props.attachments : [];
        let image = false;
        if (attachments && attachments.length > 0) {
            attachments.forEach((attachment) => {
                if (!notifyText || notifyText.length === 0) {
                    notifyText = attachment.fallback ||
                        attachment.pretext ||
                        attachment.text || '';
                }
                if (attachment.image_url && attachment.image_url.length > 0) {
                    image = true;
                }
            });
        }

        let strippedMarkdownNotifyText = stripMarkdown(notifyText);

        const notifyTextMaxLength = isWindowsApp() ? WINDOWS_NOTIFY_TEXT_MAX_LENGTH : NOTIFY_TEXT_MAX_LENGTH;
        if (strippedMarkdownNotifyText.length > notifyTextMaxLength) {
            strippedMarkdownNotifyText = strippedMarkdownNotifyText.substring(0, notifyTextMaxLength - 1) + '...';
        }

        let body = `@${username}`;
        if (strippedMarkdownNotifyText.length === 0) {
            if (msgProps.image) {
                body += Utils.localizeMessage('channel_loader.uploadedImage', ' uploaded an image');
            } else if (msgProps.otherFile) {
                body += Utils.localizeMessage('channel_loader.uploadedFile', ' uploaded a file');
            } else if (image) {
                body += Utils.localizeMessage('channel_loader.postedImage', ' posted an image');
            } else {
                body += Utils.localizeMessage('channel_loader.something', ' did something new');
            }
        } else {
            body += `: ${strippedMarkdownNotifyText}`;
        }

        //Play a sound if explicitly set in settings
        const sound = getSoundFromChannelMemberAndUser(member, user);

        // Notify if you're not looking in the right channel or when
        // the window itself is not active
        const activeChannel = getCurrentChannel(state);
        const channelId = channel ? channel.id : null;

        let notify = false;
        if (isCrtReply) {
            notify = !isThreadOpen(state, post.root_id);
        } else {
            notify = activeChannel && activeChannel.id !== channelId;
        }
        notify = notify || !state.views.browser.focused;

        let soundName = getNotificationSoundFromChannelMemberAndUser(member, user);

        const updatedState = getState();
        let url = getChannelURL(updatedState, channel, teamId);

        if (isCrtReply) {
            url = getPermalinkURL(updatedState, teamId, post.id);
        }

        // Allow plugins to change the notification, or re-enable a notification
        const args = {title, body, silent: !sound, soundName, url, notify};
        const hookResult = await dispatch(runDesktopNotificationHooks(post, msgProps, channel, teamId, args));
        if (hookResult.error) {
            dispatch(logError(hookResult.error));
            return;
        }

        let silent = false;
        ({title, body, silent, soundName, url, notify} = hookResult.args);

        if (notify) {
            if (bridge.isConnected) {
                bridge.sendMessage({
                    type: ShowNotificationMessageKey,
                    title,
                    body,
                    icon: icon50,
                    duration: 3000,
                    data: {url},
                });
            }
            dispatch(notifyMe(title, body, channel, teamId, silent, soundName, url));

            //Don't add extra sounds on native desktop clients
            if (sound && !isDesktopApp() && !isMobileApp()) {
                NotificationSounds.ding(soundName);
            }
        }
    };
}

export const notifyMe = (title, body, channel, teamId, silent, soundName, url) => (dispatch) => {
    // handle notifications in desktop app
    if (isDesktopApp()) {
        DesktopApp.dispatchNotification(title, body, channel.id, teamId, silent, soundName, url);
    } else {
        showNotification({
            title,
            body,
            requireInteraction: false,
            silent,
            onClick: () => {
                window.focus();
                getHistory().push(url);
            },
        }).catch((error) => {
            dispatch(logError(error));
        });
    }
};
