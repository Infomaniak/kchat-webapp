// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {EmoticonHappyOutlineIcon} from '@infomaniak/compass-icons/components';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {Emoji} from '@mattermost/types/emojis';
import type {ServerError} from '@mattermost/types/errors';
import type {FileInfo} from '@mattermost/types/files';
import type {Post} from '@mattermost/types/posts';

import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import * as GlobalActions from 'actions/global_actions';

import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay';
import FilePreview from 'components/file_preview';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';
import FileUpload from 'components/file_upload';
import type {FileUpload as FileUploadClass} from 'components/file_upload/file_upload';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import MessageSubmitError from 'components/message_submit_error';
import MsgTyping from 'components/msg_typing';
import OverlayTrigger from 'components/overlay_trigger';
import type {TextboxElement} from 'components/textbox';
import Textbox from 'components/textbox';
import type TextboxClass from 'components/textbox/textbox';
import {SendMessageTour} from 'components/tours/onboarding_tour';

import Constants, {Locations} from 'utils/constants';
import type {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';
import {getVoiceMessageStateFromDraft, VoiceMessageStates} from 'utils/post_utils';
import {localizeMessage} from 'utils/utils';

import type {PostDraft} from 'types/store/draft';

import FormattingBar from './formatting_bar';
import {FormattingBarSpacer, Separator} from './formatting_bar/formatting_bar';
import {IconContainer} from './formatting_bar/formatting_icon';
import SendButton from './send_button';
import ShowFormat from './show_formatting';
import TexteditorActions from './texteditor_actions';
import ToggleFormattingBar from './toggle_formatting_bar/toggle_formatting_bar';
import VoiceMessageAttachment from './voice_message_attachment';
import VoiceMessageButton from './voice_message_button';

import AutoHeightSwitcher from '../common/auto_height_switcher';
import RhsSuggestionList from '../suggestion/rhs_suggestion_list';
import Tooltip from '../tooltip';

import './advanced_text_editor.scss';

type Props = {

    /**
     * location of the advanced text editor in the UI (center channel / RHS)
     */
    location: string;
    currentUserId: string;
    message: string;
    caretPosition: number;
    showEmojiPicker: boolean;
    uploadsProgressPercent: { [clientID: string]: FilePreviewInfo };
    currentChannel?: Channel;
    errorClass: string | null;
    serverError: (ServerError & { submittedMessage?: string }) | null;
    postError?: React.ReactNode;
    isFormattingBarHidden: boolean;
    draft: PostDraft;
    showSendTutorialTip?: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    removePreview: (id: string) => void;
    setShowPreview: (newPreviewValue: boolean) => void;
    shouldShowPreview: boolean;
    maxPostSize: number;
    canPost: boolean;
    applyMarkdown: (params: ApplyMarkdownOptions) => void;
    useChannelMentions: boolean;
    badConnection: boolean;
    currentChannelTeammateUsername?: string;
    canUploadFiles: boolean;
    enableEmojiPicker: boolean;
    enableGifPicker: boolean;
    handleBlur: () => void;
    handlePostError: (postError: React.ReactNode) => void;
    emitTypingEvent: () => void;
    handleMouseUpKeyUp: (e: React.MouseEvent<TextboxElement> | React.KeyboardEvent<TextboxElement>) => void;
    handleSelect: (e: React.SyntheticEvent<TextboxElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<TextboxElement>) => void;
    postMsgKeyPress: (e: React.KeyboardEvent<TextboxElement>) => void;
    handleChange: (e: React.ChangeEvent<TextboxElement>) => void;
    toggleEmojiPicker: () => void;
    handleGifClick: (gif: string) => void;
    handleEmojiClick: (emoji: Emoji) => void;
    hideEmojiPicker: () => void;
    toggleAdvanceTextEditor: () => void;
    handleUploadProgress: (filePreviewInfo: FilePreviewInfo) => void;
    handleUploadError: (err: string | ServerError, clientId?: string, channelId?: string, rootId?: string) => void;
    handleFileUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => void;
    handleUploadStart: (clientIds: string[], channelId: string) => void;
    handleFileUploadChange: () => void;
    getFileUploadTarget: () => HTMLInputElement | null;
    fileUploadRef: React.RefObject<FileUploadClass>;
    prefillMessage?: (message: string, shouldFocus?: boolean) => void;
    channelId: string;
    postId: string;
    textboxRef: React.RefObject<TextboxClass>;
    voiceMessageClientId: string;
    handleVoiceMessageUploadStart: (clientId: string, channelOrRootId: Channel['id'] | Post['id']) => void;
    isThreadView?: boolean;
    additionalControls?: React.ReactNodeArray;
    labels?: React.ReactNode;
    setDraftAsPostType: (channelOrRootId: Channel['id'] | Post['id'], draft: PostDraft, postType?: PostDraft['postType']) => void;
    isSchedulable?: boolean;
    handleSchedulePost: (scheduleUTCTimestamp: number) => void;
}

const AdvanceTextEditor = ({
    location,
    message,
    caretPosition,
    showEmojiPicker,
    uploadsProgressPercent,
    currentChannel,
    channelId,
    postId,
    errorClass,
    serverError,
    postError,
    isFormattingBarHidden,
    draft,
    badConnection,
    handleSubmit,
    removePreview,
    showSendTutorialTip,
    setShowPreview,
    shouldShowPreview,
    maxPostSize,
    canPost,
    applyMarkdown,
    useChannelMentions,
    currentChannelTeammateUsername,
    currentUserId,
    canUploadFiles,
    enableEmojiPicker,
    enableGifPicker,
    handleBlur,
    handlePostError,
    emitTypingEvent,
    handleMouseUpKeyUp,
    handleSelect,
    handleKeyDown,
    postMsgKeyPress,
    handleChange,
    toggleEmojiPicker,
    handleGifClick,
    handleEmojiClick,
    hideEmojiPicker,
    toggleAdvanceTextEditor,
    handleUploadProgress,
    handleUploadError,
    handleFileUploadComplete,
    handleUploadStart,
    handleFileUploadChange,
    getFileUploadTarget,
    fileUploadRef,
    prefillMessage,
    textboxRef,
    voiceMessageClientId,
    setDraftAsPostType,
    handleVoiceMessageUploadStart,
    isThreadView,
    additionalControls,
    labels,
    isSchedulable,
    handleSchedulePost,
}: Props) => {
    const readOnlyChannel = !canPost;
    const {formatMessage} = useIntl();
    const ariaLabelMessageInput = localizeMessage(
        'accessibility.sections.centerFooter',
        'message input complimentary region',
    );
    const emojiPickerRef = useRef<HTMLButtonElement>(null);
    const editorActionsRef = useRef<HTMLDivElement>(null);
    const editorBodyRef = useRef<HTMLDivElement>(null);
    const isGuest = useSelector(isCurrentUserGuestUser);
    const [renderScrollbar, setRenderScrollbar] = useState(false);
    const [showFormattingSpacer, setShowFormattingSpacer] = useState(shouldShowPreview);

    const voiceMessageState = getVoiceMessageStateFromDraft(draft);

    const input = textboxRef.current?.getInputBox();

    const handleHeightChange = useCallback((height: number, maxHeight: number) => {
        setRenderScrollbar(height > maxHeight);
    }, []);

    const handleShowFormat = useCallback(() => {
        setShowPreview(!shouldShowPreview);
    }, [shouldShowPreview, setShowPreview]);

    let serverErrorJsx = null;
    if (serverError) {
        serverErrorJsx = (
            <MessageSubmitError
                error={serverError}
                submittedMessage={serverError.submittedMessage}
                handleSubmit={handleSubmit}
            />
        );
    }

    let attachmentPreview = null;
    if (!readOnlyChannel && draft.postType === Constants.PostTypes.VOICE) {
        attachmentPreview = (
            <div>
                <VoiceMessageAttachment
                    channelId={channelId}
                    rootId={postId}
                    draft={draft}
                    location={location}
                    vmState={voiceMessageState}
                    setDraftAsPostType={setDraftAsPostType}
                    uploadingClientId={voiceMessageClientId}
                    didUploadFail={Boolean(serverError)}
                    onUploadStart={handleVoiceMessageUploadStart}
                    uploadProgress={uploadsProgressPercent?.[voiceMessageClientId]?.percent ?? 0}
                    onUploadProgress={handleUploadProgress}
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleUploadError}
                    onRemoveDraft={removePreview}
                    onSubmit={handleSubmit}
                />
            </div>
        );
    } else if (!readOnlyChannel && (draft.fileInfos.length > 0 || draft.uploadsInProgress.length > 0)) {
        attachmentPreview = (
            <FilePreview
                fileInfos={draft.fileInfos}
                onRemove={removePreview}
                uploadsInProgress={draft.uploadsInProgress}
                uploadsProgressPercent={uploadsProgressPercent}
            />
        );
    }

    const getFileCount = () => {
        return draft.fileInfos.length + draft.uploadsInProgress.length;
    };

    let postType = 'post';
    if (postId) {
        postType = isThreadView ? 'thread' : 'comment';
    }

    const fileUploadJSX = readOnlyChannel ? null : (
        <FileUpload
            ref={fileUploadRef}
            fileCount={getFileCount()}
            getTarget={getFileUploadTarget}
            onFileUploadChange={handleFileUploadChange}
            onUploadStart={handleUploadStart}
            onFileUpload={handleFileUploadComplete}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
            rootId={postId}
            channelId={channelId}
            postType={postType}
            disabled={draft.postType === Constants.PostTypes.VOICE}

            // For drive sharelinks
            message={message}
            caretPosition={caretPosition}
            handleDriveSharelink={handleChange}
        />
    );

    const getEmojiPickerRef = () => {
        return emojiPickerRef.current;
    };

    let emojiPicker = null;
    const emojiButtonAriaLabel = formatMessage({
        id: 'emoji_picker.emojiPicker',
        defaultMessage: 'Emoji Picker',
    }).toLowerCase();

    if (enableEmojiPicker && !readOnlyChannel) {
        const emojiPickerTooltip = (
            <Tooltip id='upload-tooltip'>
                <KeyboardShortcutSequence
                    shortcut={KEYBOARD_SHORTCUTS.msgShowEmojiPicker}
                    hoistDescription={true}
                    isInsideTooltip={true}
                />
            </Tooltip>
        );
        emojiPicker = (
            <>
                <EmojiPickerOverlay
                    show={showEmojiPicker}
                    target={getEmojiPickerRef}
                    onHide={hideEmojiPicker}
                    onEmojiClick={handleEmojiClick}
                    onGifClick={handleGifClick}
                    enableGifPicker={enableGifPicker}
                    topOffset={-7}
                />
                <OverlayTrigger
                    placement='top'
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                    overlay={emojiPickerTooltip}
                >
                    <IconContainer
                        id={'emojiPickerButton'}
                        ref={emojiPickerRef}
                        onClick={toggleEmojiPicker}
                        type='button'
                        aria-label={emojiButtonAriaLabel}
                        disabled={shouldShowPreview || draft.postType === Constants.PostTypes.VOICE}
                        className={classNames({active: showEmojiPicker})}
                    >
                        <EmoticonHappyOutlineIcon
                            color={'currentColor'}
                            size={18}
                        />
                    </IconContainer>
                </OverlayTrigger>
            </>
        );
    }

    const hasDraftMessagesOrFileAttachments = message.trim().length !== 0 || draft.fileInfos.length !== 0 || draft.uploadsInProgress.length !== 0;

    const voiceMessageButton = !readOnlyChannel && (location === Locations.CENTER || location === Locations.RHS_COMMENT) ? (
        <VoiceMessageButton
            channelId={channelId}
            rootId={postId}
            location={location}
            draft={draft}
            disabled={readOnlyChannel ||
                voiceMessageState === VoiceMessageStates.RECORDING ||
                voiceMessageState === VoiceMessageStates.UPLOADING || voiceMessageState === VoiceMessageStates.ATTACHED ||
                hasDraftMessagesOrFileAttachments}
            onClick={setDraftAsPostType}
        />
    ) : null;

    const isSendButtonDisabled = readOnlyChannel ||
        voiceMessageState === VoiceMessageStates.RECORDING || voiceMessageState === VoiceMessageStates.UPLOADING ||
        !hasDraftMessagesOrFileAttachments;

    const sendButton = readOnlyChannel ? null : (
        <SendButton
            disabled={isSendButtonDisabled}
            isSchedulable={isSchedulable}
            handleSubmit={handleSubmit}
            handleSchedulePost={handleSchedulePost}
        />
    );

    const showFormatJSX = isSendButtonDisabled || draft.postType === Constants.PostTypes.VOICE ? null : (
        <ShowFormat
            onClick={handleShowFormat}
            active={shouldShowPreview}
        />
    );

    let createMessage;
    if (currentChannel && !readOnlyChannel) {
        createMessage = formatMessage(
            {
                id: 'create_post.write',
                defaultMessage: 'Write to {channelDisplayName}',
            },
            {channelDisplayName: currentChannel.display_name},
        );
    } else if (readOnlyChannel) {
        createMessage = localizeMessage(
            'create_post.read_only',
            'This channel is read-only. Only members with permission can post here.',
        );
    } else {
        createMessage = localizeMessage('create_comment.addComment', 'Reply to this thread...');
    }

    const messageValue = readOnlyChannel ? '' : message;

    /**
     * by getting the value directly from the textbox we eliminate all unnecessary
     * re-renders for the FormattingBar component. The previous method of always passing
     * down the current message value that came from the parents state was not optimal,
     * although still working as expected
     */
    const getCurrentValue = useCallback(() => textboxRef.current?.getInputBox().value, [textboxRef]);
    const getCurrentSelection = useCallback(() => {
        const input = textboxRef.current?.getInputBox();

        return {
            start: input.selectionStart,
            end: input.selectionEnd,
        };
    }, [textboxRef]);

    let textboxId = 'textbox';

    switch (location) {
    case Locations.CENTER:
        textboxId = 'post_textbox';
        break;
    case Locations.RHS_COMMENT:
        textboxId = 'reply_textbox';
        break;
    case Locations.MODAL:
        textboxId = 'modal_textbox';
        break;
    case Locations.SCHEDULED_DRAFT:
        textboxId = 'scheduled_draft_editor_textbox';
        break;
    }

    const showFormattingBar = !isFormattingBarHidden && !readOnlyChannel;

    const handleWidthChange = useCallback((width: number) => {
        if (!editorBodyRef.current || !editorActionsRef.current || !input) {
            return;
        }

        const maxWidth = editorBodyRef.current.offsetWidth - editorActionsRef.current.offsetWidth;

        if (!message) {
            // if we do not have a message we can just render the default state
            setShowFormattingSpacer(false);
            return;
        }

        if (width >= maxWidth) {
            setShowFormattingSpacer(true);
        } else {
            setShowFormattingSpacer(false);
        }
    }, [message, input]);

    useEffect(() => {
        if (!message) {
            handleWidthChange(0);
        }
    }, [handleWidthChange, message]);

    const formattingBar = (
        <AutoHeightSwitcher
            showSlot={showFormattingBar ? 1 : 2}
            slot1={(
                <FormattingBar
                    applyMarkdown={applyMarkdown}
                    getCurrentMessage={getCurrentValue}
                    getCurrentSelection={getCurrentSelection}
                    disableControls={shouldShowPreview || draft.postType === Constants.PostTypes.VOICE}
                    additionalControls={additionalControls}
                    location={location}
                />
            )}
            slot2={null}
        />
    );

    return (
        <>
            {
                readOnlyChannel && !isGuest ? (
                    <div
                        className='post-create__container'
                        id='post-create'
                    >
                        <div
                            id='channelArchivedMessage'
                            className='channel-archived__message'
                        >
                            <button
                                className='btn btn-primary channel-archived__close-btn'
                                onClick={() => GlobalActions.joinChannel(channelId)}
                            >
                                <FormattedMessage
                                    id='joinChannel.joiningButtonChannel'
                                    defaultMessage='Join Channel'
                                />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            className={classNames('AdvancedTextEditor', {
                                'AdvancedTextEditor__attachment-disabled': !canUploadFiles,
                                scroll: renderScrollbar,
                                'formatting-bar': showFormattingBar,
                            })}
                        >
                            <div
                                id={'speak-'}
                                aria-live='assertive'
                                className='sr-only'
                            >
                                <FormattedMessage
                                    id='channelView.login.successfull'
                                    defaultMessage='Login Successfull'
                                />
                            </div>
                            <div
                                className={'AdvancedTextEditor__body'}
                                disabled={readOnlyChannel}
                            >
                                <div
                                    ref={editorBodyRef}
                                    role='application'
                                    id='advancedTextEditorCell'
                                    data-a11y-sort-order='2'
                                    aria-label={localizeMessage(
                                        'channelView.login.successfull',
                                        'Login Successfull',
                                    ) + ' ' + ariaLabelMessageInput}
                                    tabIndex={-1}
                                    className='AdvancedTextEditor__cell a11y__region'
                                >
                                    {labels}
                                    <Textbox
                                        hasLabels={Boolean(labels)}
                                        suggestionList={RhsSuggestionList}
                                        onChange={handleChange}
                                        onKeyPress={postMsgKeyPress}
                                        onKeyDown={handleKeyDown}
                                        onSelect={handleSelect}
                                        onMouseUp={handleMouseUpKeyUp}
                                        onKeyUp={handleMouseUpKeyUp}
                                        onComposition={emitTypingEvent}
                                        onHeightChange={handleHeightChange}
                                        handlePostError={handlePostError}
                                        value={messageValue}
                                        onBlur={handleBlur}
                                        emojiEnabled={enableEmojiPicker}
                                        createMessage={createMessage}
                                        channelId={channelId}
                                        id={textboxId}
                                        ref={textboxRef!}
                                        disabled={readOnlyChannel}
                                        hidden={draft.postType === Constants.PostTypes.VOICE}
                                        characterLimit={maxPostSize}
                                        preview={shouldShowPreview}
                                        badConnection={badConnection}
                                        useChannelMentions={useChannelMentions}
                                        rootId={postId}
                                        onWidthChange={handleWidthChange}
                                    />
                                    {attachmentPreview}
                                    {!readOnlyChannel && (showFormattingBar || shouldShowPreview) && (
                                        <TexteditorActions
                                            placement='top'
                                            isScrollbarRendered={renderScrollbar}
                                        >
                                            {showFormatJSX}
                                        </TexteditorActions>
                                    )}
                                    {showFormattingSpacer || shouldShowPreview || attachmentPreview ? (
                                        <FormattingBarSpacer>
                                            {formattingBar}
                                        </FormattingBarSpacer>
                                    ) : formattingBar}
                                    {!readOnlyChannel && (
                                        <TexteditorActions
                                            ref={editorActionsRef}
                                            placement='bottom'
                                        >
                                            <ToggleFormattingBar
                                                onClick={toggleAdvanceTextEditor}
                                                active={showFormattingBar}
                                                disabled={shouldShowPreview}
                                            />
                                            <Separator/>
                                            {fileUploadJSX}
                                            {emojiPicker}
                                            {voiceMessageButton}
                                            {sendButton}
                                        </TexteditorActions>
                                    )}
                                </div>
                                {showSendTutorialTip && currentChannel && prefillMessage && (
                                    <SendMessageTour
                                        prefillMessage={prefillMessage}
                                        currentChannel={currentChannel}
                                        currentUserId={currentUserId}
                                        currentChannelTeammateUsername={currentChannelTeammateUsername}
                                    />
                                )}
                            </div>
                        </div>
                        <div
                            id='postCreateFooter'
                            role='form'
                            className={classNames('AdvancedTextEditor__footer', {
                                'AdvancedTextEditor__footer--has-error': postError || serverError,
                            })}
                        >
                            {postError && <label className={classNames('post-error', {errorClass})}>{postError}</label>}
                            {serverErrorJsx}
                            <MsgTyping
                                channelId={channelId}
                                postId={postId}
                            />
                        </div>
                    </>
                )
            }
        </>
    );
};

export default AdvanceTextEditor;

