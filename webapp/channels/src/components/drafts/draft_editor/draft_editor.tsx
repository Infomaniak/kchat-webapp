// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import {CheckCircleOutlineIcon} from '@infomaniak/compass-icons/components';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {Channel, ChannelMemberCountsByGroup} from '@mattermost/types/channels';
import type {Emoji} from '@mattermost/types/emojis';
import type {ServerError} from '@mattermost/types/errors';
import type {FileInfo} from '@mattermost/types/files';
import type {Group} from '@mattermost/types/groups';
import {GroupSource} from '@mattermost/types/groups';
import type {PostPriorityMetadata} from '@mattermost/types/posts';
import type {PreferenceType} from '@mattermost/types/preferences';

import type {ActionResult} from 'mattermost-redux/types/actions';
import {sortFileInfos} from 'mattermost-redux/utils/file_utils';

import AdvancedTextEditor from 'components/advanced_text_editor/advanced_text_editor';
import EditPostFooter from 'components/edit_post/edit_post_footer';
import FileLimitStickyBanner from 'components/file_limit_sticky_banner';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';
import type {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import NotifyConfirmModal from 'components/notify_confirm_modal';
import OverlayTrigger from 'components/overlay_trigger';
import PriorityLabel from 'components/post_priority/post_priority_label';
import PostPriorityPickerOverlay from 'components/post_priority/post_priority_picker_overlay';
import type {TextboxElement} from 'components/textbox';
import type TextboxClass from 'components/textbox/textbox';
import Tooltip from 'components/tooltip';

import Constants, {
    Locations,
    Preferences,
    AdvancedTextEditor as AdvancedTextEditorConst,
    ModalIdentifiers,
    StoragePrefixes,
} from 'utils/constants';
import * as Keyboard from 'utils/keyboard';
import {applyMarkdown} from 'utils/markdown/apply_markdown';
import type {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';
import {
    postMessageOnKeyPress,
    isErrorInvalidSlashCommand,
    splitMessageBasedOnCaretPosition,
    specialMentionsInText,
    groupsMentionedInText,
} from 'utils/post_utils';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils';

import type {ModalData} from 'types/actions';
import type {PostDraft} from 'types/store/draft';

import './draft_editor.scss';

const KeyCodes = Constants.KeyCodes;

type Props = {
    canPost: boolean;
    currentUserId: string;
    draft: PostDraft;
    channel: Channel;
    isFormattingBarHidden: boolean;
    maxPostSize: number;
    badConnection: boolean;
    canUseChannelMentions: boolean;
    canUploadFiles: boolean;
    canUseCustomGroupMentions: boolean;
    isEmojiPickerEnabled: boolean;
    isGifPickerEnabled: boolean;
    isPostPriorityEnabled: boolean;
    isConfirmNotificationsToChannnelEnabled: boolean;
    isTimezoneEnabled: boolean;
    codeBlockOnCtrlEnter: boolean;
    ctrlSend: boolean;
    locale: string;
    groupsWithAllowReference: Map<string, Group> | null;
    channelMemberCountsByGroup: ChannelMemberCountsByGroup;
    channelMembersCount: number;
    onCancel: () => void;
    onEdit: () => void;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
        upsertScheduleDraft: (key: string, draft: PostDraft, rootId: string) => Promise<ActionResult>;
        getChannelTimezones: (channelId: string) => Promise<ActionResult>;
        getChannelStats: (channelId: string) => Promise<ActionResult>;
    };
};

type State = {
    draft: PostDraft;
    showEmojiPicker: boolean;
    uploadsProgressPercent: {[clientID: string]: FilePreviewInfo};
    postError: React.ReactNode;
    serverError: (ServerError & {submittedMessage?: string}) | null;
    showPreview: boolean;
    caretPosition: number;
    showPostPriorityPicker: boolean;
    submitting: boolean;
};

const noop = () => null;

class DraftEditor extends React.PureComponent<Props, State> {
    textboxRef: React.RefObject<TextboxClass>;
    fileUploadRef: React.RefObject<FileUploadClass>;
    postPriorityPickerRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);
        this.state = {
            draft: this.props.draft,
            showEmojiPicker: false,
            uploadsProgressPercent: {},
            postError: null,
            serverError: null,
            showPreview: false,
            caretPosition: this.props.draft.message.length,
            showPostPriorityPicker: false,
            submitting: false,
        };

        this.textboxRef = React.createRef<TextboxClass>();
        this.fileUploadRef = React.createRef<FileUploadClass>();
        this.postPriorityPickerRef = React.createRef<HTMLButtonElement>();
    }

    componentDidMount() {
        const {
            actions,
            channel,
            channelMembersCount,
        } = this.props;
        this.focusTextbox();
        if (channelMembersCount === 1 && channel.type !== 'D') {
            // Channel stats might not be fetched
            actions.getChannelStats(channel.id);
        }
    }

    handleMouseUpKeyUp = (e: React.MouseEvent | React.KeyboardEvent) => {
        this.setState({
            caretPosition: (e.target as HTMLInputElement).selectionStart || 0,
        });
    };

    toggleEmojiPicker = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        e?.stopPropagation();
        const showEmojiPicker = !this.state.showEmojiPicker;
        if (!showEmojiPicker) {
            this.focusTextbox();
        }
        this.setState({showEmojiPicker});
    };

    handlePostError = (postError: React.ReactNode) => {
        if (this.state.postError !== postError) {
            this.setState({postError});
        }
    };

    toggleAdvanceTextEditor = () => this.props.actions.savePreferences(this.props.currentUserId, [{
        category: Preferences.ADVANCED_TEXT_EDITOR,
        user_id: this.props.currentUserId,
        name: AdvancedTextEditorConst.POST,
        value: String(!this.props.isFormattingBarHidden),
    }]);

    applyMarkdown = (params: ApplyMarkdownOptions) => {
        if (this.state.showPreview) {
            return;
        }

        const res = applyMarkdown(params);

        this.setState({
            draft: {
                ...this.state.draft,
                message: res.message,
            },
        }, () => {
            const textbox = this.textboxRef.current?.getInputBox();
            Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);
        });
    };

    handleKeyDown = (e: React.KeyboardEvent<TextboxElement>) => {
        const {message} = this.state.draft;
        const {
            selectionStart,
            selectionEnd,
            value,
        } = e.target as TextboxElement;

        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const ctrlEnterKeyCombo = (this.props.ctrlSend || this.props.codeBlockOnCtrlEnter) && Keyboard.isKeyPressed(e, KeyCodes.ENTER) && ctrlOrMetaKeyPressed;
        const ctrlKeyCombo = Keyboard.cmdOrCtrlPressed(e) && !e.altKey && !e.shiftKey;
        const ctrlAltCombo = Keyboard.cmdOrCtrlPressed(e, true) && e.altKey;
        const shiftAltCombo = !Keyboard.cmdOrCtrlPressed(e) && e.shiftKey && e.altKey;

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            this.setState({draft: {
                ...this.state.draft,
                message: Utils.insertLineBreakFromKeyEvent(e),
            }});
            return;
        }

        if (ctrlEnterKeyCombo) {
            this.handleShowPreview(false);
            this.postMsgKeyPress(e);
            return;
        }

        if (Keyboard.isKeyPressed(e, KeyCodes.ESCAPE)) {
            this.textboxRef.current?.blur();
        }

        if (ctrlKeyCombo) {
            if (Keyboard.isKeyPressed(e, KeyCodes.B)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'bold',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Keyboard.isKeyPressed(e, KeyCodes.I)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'italic',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            }
        } else if (ctrlAltCombo) {
            if (Keyboard.isKeyPressed(e, KeyCodes.K)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'link',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Keyboard.isKeyPressed(e, KeyCodes.C)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'code',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Keyboard.isKeyPressed(e, KeyCodes.E)) {
                e.stopPropagation();
                e.preventDefault();
                this.toggleEmojiPicker();
            } else if (Keyboard.isKeyPressed(e, KeyCodes.T)) {
                e.stopPropagation();
                e.preventDefault();
                this.toggleAdvanceTextEditor();
            } else if (Keyboard.isKeyPressed(e, KeyCodes.P) && message.length) {
                e.stopPropagation();
                e.preventDefault();
                this.handleShowPreview(!this.state.showPreview);
            }
        } else if (shiftAltCombo) {
            if (Keyboard.isKeyPressed(e, KeyCodes.X)) {
                e.stopPropagation();
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'strike',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Keyboard.isKeyPressed(e, KeyCodes.SEVEN)) {
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'ol',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Keyboard.isKeyPressed(e, KeyCodes.EIGHT)) {
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'ul',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            } else if (Keyboard.isKeyPressed(e, KeyCodes.NINE)) {
                e.preventDefault();
                this.applyMarkdown({
                    markdownMode: 'quote',
                    selectionStart,
                    selectionEnd,
                    message: value,
                });
            }
        }
    };

    setMessageAndCaretPostion = (newMessage: string, newCaretPosition: number) => {
        const textbox = this.textboxRef.current?.getInputBox();

        this.setState({
            draft: {
                ...this.state.draft,
                message: newMessage,
            },
            caretPosition: newCaretPosition,
        }, () => {
            Utils.setCaretPosition(textbox, newCaretPosition);
        });
    };

    hideEmojiPicker = () => this.setState({showEmojiPicker: false});

    handleEmojiClick = (emoji: Emoji) => {
        const {message} = this.state.draft;
        const emojiAlias = ('short_names' in emoji && emoji.short_names && emoji.short_names[0]) || emoji.name;

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (message.length) {
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(this.state.caretPosition, message);

            // check whether the first piece of the message is empty when cursor is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;

            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;
            this.setMessageAndCaretPostion(newMessage, newCaretPosition);
        } else {
            const newMessage = ':' + emojiAlias + ': ';
            this.setMessageAndCaretPostion(newMessage, newMessage.length);
        }

        this.hideEmojiPicker();
    };

    handleGifClick = (gif: string) => {
        const {message} = this.state.draft;
        if (message.length) {
            const newMessage = (/\s+$/).test(message) ? message + gif : message + ' ' + gif;
            this.setState({draft: {
                ...this.state.draft,
                message: newMessage,
            }});
        } else {
            this.setState({draft: {
                ...this.state.draft,
                message: gif,
            }});
        }
        this.hideEmojiPicker();
    };

    handleShowPreview = (showPreview: boolean) => {
        this.setState({showPreview}, () => {
            if (!showPreview) {
                this.focusTextbox();
            }
        });
    };

    showNotifyAllModal = (mentions: string[], channelTimezoneCount: number, memberNotifyCount: number) => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NOTIFY_CONFIRM_MODAL,
            dialogType: NotifyConfirmModal,
            dialogProps: {
                mentions,
                channelTimezoneCount,
                memberNotifyCount,
                onConfirm: this.updateDraft,
            },
        });
    };

    handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const {
            isConfirmNotificationsToChannnelEnabled,
            canUseChannelMentions,
            canUseCustomGroupMentions,
            groupsWithAllowReference,
            channelMemberCountsByGroup,
            channelMembersCount,
            channel,
            isTimezoneEnabled,
            actions,
        } = this.props;
        const {
            draft,
            submitting,
        } = this.state;
        const {message} = draft;

        if (draft.uploadsInProgress.length > 0 || submitting || (message.trim().length === 0 && draft.fileInfos.length === 0)) {
            return;
        }

        this.setState({showPreview: false});

        const notificationsToChannel = isConfirmNotificationsToChannnelEnabled && canUseChannelMentions;
        let memberNotifyCount = 0;
        let channelTimezoneCount = 0;
        let mentions: string[] = [];

        const specialMentions = specialMentionsInText(message);
        const hasSpecialMentions = Object.values(specialMentions).includes(true);

        if (isConfirmNotificationsToChannnelEnabled && !hasSpecialMentions && canUseCustomGroupMentions) {
            // Groups mentioned in users text
            const mentionGroups = groupsMentionedInText(message, groupsWithAllowReference);
            if (mentionGroups.length > 0) {
                mentionGroups.
                    forEach((group) => {
                        if (group.source === GroupSource.Ldap) {
                            return;
                        }
                        const mappedValue = channelMemberCountsByGroup[group.id];
                        if (mappedValue && mappedValue.channel_member_count > Constants.NOTIFY_ALL_MEMBERS && mappedValue.channel_member_count > memberNotifyCount) {
                            memberNotifyCount = mappedValue.channel_member_count;
                            channelTimezoneCount = mappedValue.channel_member_timezones_count;
                        }
                        mentions.push(`@${group.name}`);
                    });
                mentions = [...new Set(mentions)];
            }
        }

        if (notificationsToChannel && channelMembersCount > Constants.NOTIFY_ALL_MEMBERS && hasSpecialMentions) {
            memberNotifyCount = channelMembersCount - 1;

            for (const k in specialMentions) {
                if (specialMentions[k]) {
                    mentions.push('@' + k);
                }
            }

            if (isTimezoneEnabled) {
                const {data} = await actions.getChannelTimezones(channel.id);
                channelTimezoneCount = data ? data.length : 0;
            }
        }

        if (memberNotifyCount > 0) {
            this.showNotifyAllModal(mentions, channelTimezoneCount, memberNotifyCount);
            return;
        }

        this.updateDraft();
    };

    updateDraft = async () => {
        const {timestamp} = this.props.draft;
        const {draft} = this.state;
        const newDraft = {
            ...draft,
            timestamp,
        };
        const key = draft.rootId ? StoragePrefixes.COMMENT_DRAFT + draft.rootId : StoragePrefixes.DRAFT + draft.channelId;
        const {error} = await this.props.actions.upsertScheduleDraft(key, newDraft, draft.rootId);
        if (error) {
            this.setState({serverError: {
                ...error,
                submittedMessage: draft.message,
            }});
            return;
        }
        this.props.onEdit();
    };

    postMsgKeyPress = (e: React.KeyboardEvent<TextboxElement>) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const {allowSending, withClosedCodeBlock, ignoreKeyPress, message} = postMessageOnKeyPress(
            e,
            this.state.draft.message,
            Boolean(ctrlSend),
            Boolean(codeBlockOnCtrlEnter),
            Date.now(),
            0,
            this.state.caretPosition,
        ) as {
            allowSending: boolean;
            withClosedCodeBlock?: boolean;
            ignoreKeyPress?: boolean;
            message?: string;
        };

        if (ignoreKeyPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (allowSending) {
            if (e.persist) {
                e.persist();
            }
            if (this.textboxRef.current) {
                this.textboxRef.current.blur();
            }

            if (withClosedCodeBlock && message) {
                this.setState({draft: {
                    ...this.state.draft,
                    message,
                }}, () => this.handleSubmit(e));
            } else {
                this.handleSubmit(e);
            }

            this.handleShowPreview(false);
        }
    };

    focusTextbox = (keepFocus = false) => {
        const postTextboxDisabled = !this.props.canPost;
        if (this.textboxRef.current && postTextboxDisabled) {
            this.textboxRef.current.blur(); // Fixes Firefox bug which causes keyboard shortcuts to be ignored (MM-22482)
            return;
        }
        if (this.textboxRef.current && (keepFocus || !UserAgent.isMobile())) {
            this.textboxRef.current.focus();
        }
    };

    handlePostPriorityApply = (settings?: PostPriorityMetadata) => {
        const updatedDraft = {...this.state.draft};

        if (settings?.priority || settings?.requested_ack) {
            updatedDraft.metadata = {
                priority: {
                    ...settings,
                    priority: settings!.priority || '',
                    requested_ack: settings!.requested_ack,
                },
            };
        } else {
            updatedDraft.metadata = {};
        }

        this.setState({draft: updatedDraft});
        this.focusTextbox();
    };

    handlePostPriorityHide = () => {
        this.setState({showPostPriorityPicker: false});
        this.focusTextbox();
    };

    handleUploadStart = (clientIds: string[]) => {
        const draft = {
            ...this.state.draft,
            uploadsInProgress: [...this.state.draft.uploadsInProgress, ...clientIds],
        };
        this.setState({draft});
        this.focusTextbox();
    };

    handleUploadProgress = (filePreviewInfo: FilePreviewInfo) => {
        const uploadsProgressPercent = {
            ...this.state.uploadsProgressPercent,
            [filePreviewInfo.clientId]: filePreviewInfo,
        };
        this.setState({uploadsProgressPercent});
    };

    handleFileUploadComplete = (fileInfos: FileInfo[], clientIds: string[]) => {
        const draft = {...this.state.draft};

        // remove each finished file from uploads
        for (let i = 0; i < clientIds.length; i++) {
            if (draft.uploadsInProgress) {
                const index = draft.uploadsInProgress.indexOf(clientIds[i]);

                if (index !== -1) {
                    draft.uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                }
            }
        }

        if (draft.fileInfos) {
            draft.fileInfos = sortFileInfos(draft.fileInfos.concat(fileInfos), this.props.locale);
        }

        this.setState({draft});
    };

    handleUploadError = (err: string | ServerError, clientId?: string, channelId?: string) => {
        let serverError = null;
        if (typeof err === 'string' && err.length > 0) {
            serverError = new Error(err);
        }

        if (!channelId || !clientId) {
            this.setState({serverError});
            return;
        }

        const draft = {...this.state.draft};

        if (draft.uploadsInProgress) {
            const index = draft.uploadsInProgress.indexOf(clientId);

            if (index !== -1) {
                const uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);
                const modifiedDraft = {
                    ...draft,
                    uploadsInProgress,
                };
                this.setState({draft: modifiedDraft});
            }
        }

        this.setState({serverError});
    };

    getFileUploadTarget = () => this.textboxRef.current?.getInputBox();

    handleChange = (e: React.ChangeEvent<TextboxElement>) => {
        const message = e.target.value;

        let serverError = this.state.serverError;
        if (isErrorInvalidSlashCommand(serverError)) {
            serverError = null;
        }

        const draft = {
            ...this.state.draft,
            message,
        };

        this.setState({
            draft,
            serverError,
        });
    };

    prefillMessage = (message: string, shouldFocus?: boolean) => {
        this.setMessageAndCaretPostion(message, message.length);

        if (shouldFocus) {
            const inputBox = this.textboxRef.current?.getInputBox();
            if (inputBox) {
                // programmatic click needed to close the create post tip
                inputBox.click();
            }
            this.focusTextbox(true);
        }
    };

    removePreview = (id: string) => {
        let modifiedDraft = {} as PostDraft;
        const draft = {...this.state.draft};

        // Clear previous errors
        this.setState({serverError: null});

        // id can either be the id of an uploaded file or the client id of an in progress upload
        let index = draft.fileInfos.findIndex((info) => info.id === id);
        if (index === -1) {
            index = draft.uploadsInProgress.indexOf(id);

            if (index !== -1) {
                const uploadsInProgress = draft.uploadsInProgress.filter((item, itemIndex) => index !== itemIndex);

                modifiedDraft = {
                    ...draft,
                    uploadsInProgress,
                };

                if (this.fileUploadRef.current && this.fileUploadRef.current) {
                    this.fileUploadRef.current.cancelUpload(id);
                }
            }
        } else {
            const fileInfos = draft.fileInfos.filter((item, itemIndex) => index !== itemIndex);

            modifiedDraft = {
                ...draft,
                fileInfos,
            };
        }

        this.setState({draft: modifiedDraft});
        this.focusTextbox();
    };

    handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.onCancel();
    };

    getPriorityLabels = () => {
        const priority = this.state.draft.metadata?.priority;
        const hasPriorityLabels = this.props.isPostPriorityEnabled && priority && (priority.priority || priority.requested_ack);
        if (!hasPriorityLabels) {
            return null;
        }
        return (
            <div className='AdvancedTextEditor__priority'>
                {priority!.priority && (
                    <PriorityLabel
                        size='xs'
                        priority={priority!.priority}
                    />
                )}
                {priority!.requested_ack && (
                    <div className='AdvancedTextEditor__priority-ack'>
                        <OverlayTrigger
                            placement='top'
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                            overlay={(
                                <Tooltip
                                    id='post-priority-picker-ack-tooltip'
                                    className='AdvancedTextEditor__priority-ack-tooltip'
                                >
                                    <FormattedMessage
                                        id={'post_priority.request_acknowledgement.tooltip'}
                                        defaultMessage={'Acknowledgement will be requested'}
                                    />
                                </Tooltip>
                            )}
                        >
                            <CheckCircleOutlineIcon size={14}/>
                        </OverlayTrigger>
                        {!(priority!.priority) && (
                            <FormattedMessage
                                id={'post_priority.request_acknowledgement'}
                                defaultMessage={'Request acknowledgement'}
                            />
                        )}
                    </div>
                )}
                {!this.state.showPreview && (
                    <OverlayTrigger
                        placement='top'
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                        overlay={(
                            <Tooltip id='post-priority-picker-tooltip'>
                                <FormattedMessage
                                    id={'post_priority.remove'}
                                    defaultMessage={'Remove {priority}'}
                                    values={{priority: priority!.priority}}
                                />
                            </Tooltip>
                        )}
                    >
                        <button
                            type='button'
                            className='close'
                            onClick={() => this.handlePostPriorityApply()}
                        >
                            <span aria-hidden='true'>{'×'}</span>
                            <span className='sr-only'>
                                <FormattedMessage
                                    id={'post_priority.remove'}
                                    defaultMessage={'Remove {priority}'}
                                    values={{priority: priority!.priority}}
                                />
                            </span>
                        </button>
                    </OverlayTrigger>
                )}
            </div>
        );
    };

    render() {
        const showFileLimitStickyBanner = this.props.canPost && (this.state.draft.fileInfos.length > 0 || this.state.draft.uploadsInProgress.length > 0);
        const labels = this.getPriorityLabels();
        return (
            <form
                id='draft-editor'
                onSubmit={this.handleSubmit}
            >
                {showFileLimitStickyBanner && <FileLimitStickyBanner/>}
                <AdvancedTextEditor
                    location={Locations.SCHEDULED_DRAFT}
                    textboxRef={this.textboxRef}
                    currentUserId={this.props.currentUserId}
                    postError={this.state.postError}
                    handlePostError={this.handlePostError}
                    serverError={this.state.serverError}
                    message={this.state.draft.message}
                    showEmojiPicker={this.state.showEmojiPicker}
                    uploadsProgressPercent={this.state.uploadsProgressPercent}
                    currentChannel={this.props.channel}
                    postId={this.props.draft.rootId}
                    channelId={this.props.channel.id}
                    errorClass={null}
                    isFormattingBarHidden={this.props.isFormattingBarHidden}
                    draft={this.state.draft}
                    showSendTutorialTip={false}
                    handleSubmit={this.handleSubmit}
                    setShowPreview={this.handleShowPreview}
                    shouldShowPreview={this.state.showPreview}
                    maxPostSize={this.props.maxPostSize}
                    canPost={this.props.canPost}
                    applyMarkdown={this.applyMarkdown}
                    badConnection={this.props.badConnection}
                    useChannelMentions={this.props.canUseChannelMentions}
                    canUploadFiles={this.props.canUploadFiles}
                    enableEmojiPicker={this.props.isEmojiPickerEnabled}
                    enableGifPicker={this.props.isGifPickerEnabled}
                    handleBlur={noop}
                    emitTypingEvent={noop}
                    handleMouseUpKeyUp={this.handleMouseUpKeyUp}
                    toggleEmojiPicker={this.toggleEmojiPicker}
                    toggleAdvanceTextEditor={this.toggleAdvanceTextEditor}
                    handleKeyDown={this.handleKeyDown}
                    isSchedulable={false}
                    handleGifClick={this.handleGifClick}
                    hideEmojiPicker={this.hideEmojiPicker}
                    handleEmojiClick={this.handleEmojiClick}
                    fileUploadRef={this.fileUploadRef}
                    labels={labels}
                    handleSchedulePost={noop}
                    postMsgKeyPress={this.postMsgKeyPress}
                    handleUploadStart={this.handleUploadStart}
                    handleUploadProgress={this.handleUploadProgress}
                    handleUploadError={this.handleUploadError}
                    handleFileUploadComplete={this.handleFileUploadComplete}
                    handleFileUploadChange={this.focusTextbox}
                    getFileUploadTarget={this.getFileUploadTarget}
                    handleChange={this.handleChange}
                    prefillMessage={this.prefillMessage}
                    removePreview={this.removePreview}
                    caretPosition={this.state.caretPosition}
                    additionalControls={[
                        this.props.isPostPriorityEnabled && (
                            <React.Fragment key='PostPriorityPicker'>
                                <PostPriorityPickerOverlay
                                    settings={this.state.draft?.metadata?.priority}
                                    disabled={false}
                                    onApply={this.handlePostPriorityApply}
                                    onClose={this.handlePostPriorityHide}
                                />
                            </React.Fragment>
                        ),
                    ].filter(Boolean)}
                />
                <EditPostFooter
                    onSave={this.handleSubmit}
                    onCancel={this.handleCancel}
                />
            </form>
        );
    }
}

export default DraftEditor;
