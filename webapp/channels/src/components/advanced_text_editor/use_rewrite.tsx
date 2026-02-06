// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {RefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {useIntl} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import type {TextboxClass} from 'components/textbox';

import IconEuria from 'plugins/ai/components/assets/icon_euria';

import type {PostDraft} from 'types/store/draft';

import type {RewriteAction} from './rewrite_action';
import RewriteMenu from './rewrite_menu';

import './use_rewrite.scss';

const RewriteOverlay = ({text}: {text: string}) => (
    <div className='rewrite-overlay'>
        <div className='rewrite-overlay__content'>
            <IconEuria
                height={16}
                width={16}
            />
            <span>{text}</span>
        </div>
    </div>
);

interface UseRewriteParams {
    draft: PostDraft;
    handleDraftChange: (draft: PostDraft, options?: {instant?: boolean; show?: boolean}) => void;
    focusTextbox: (keepFocus?: boolean) => void;
    setServerError: (error: Error | null) => void;
    textboxRef: RefObject<TextboxClass>;
    disabled?: boolean;
}

interface UseRewriteResult {
    rewriteControl: JSX.Element;
    isRewriting: boolean;
}

const useRewrite = ({
    draft,
    handleDraftChange,
    focusTextbox,
    setServerError,
    textboxRef,
    disabled = false,
}: UseRewriteParams): UseRewriteResult => {
    const {formatMessage} = useIntl();
    const [isRewriting, setIsRewriting] = useState(false);
    const [originalMessage, setOriginalMessage] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<RewriteAction | null>(null);
    const [lastCustomPrompt, setLastCustomPrompt] = useState<string | undefined>(undefined);
    const abortControllerRef = useRef<AbortController | null>(null);

    const hasMessage = Boolean(draft.message.trim());

    useEffect(() => {
        const input = textboxRef.current?.getInputBox();
        if (!input) {
            return undefined;
        }

        const wrapper = input.parentElement;
        if (!wrapper) {
            return undefined;
        }

        if (isRewriting) {
            wrapper.style.position = 'relative';

            const container = document.createElement('div');
            wrapper.appendChild(container);

            const text = formatMessage({
                id: 'texteditor.rewrite.rewriting',
                defaultMessage: 'Thinking...',
            });
            ReactDOM.render(<RewriteOverlay text={text}/>, container);

            return () => {
                ReactDOM.unmountComponentAtNode(container);
                container.remove();
            };
        }

        return undefined;
    }, [isRewriting, textboxRef, formatMessage]);

    const handleRewrite = useCallback(async (action: RewriteAction, customPrompt?: string) => {
        if (!draft.message.trim()) {
            return;
        }

        const messageBeforeRewrite = draft.message;
        setIsRewriting(true);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const rewrittenMessage = await Client4.getAIRewrittenMessage(
                draft.message,
                action,
                customPrompt,
            );

            if (abortController.signal.aborted) {
                return;
            }

            if (originalMessage === null) {
                setOriginalMessage(messageBeforeRewrite);
            }
            setLastAction(action);
            setLastCustomPrompt(customPrompt);

            handleDraftChange({
                ...draft,
                message: rewrittenMessage,
            });
            focusTextbox(true);
        } catch (error) {
            if (abortController.signal.aborted) {
                // eslint-disable-next-line no-console
                console.info('[Rewrite] Aborted, ignoring error:', error);
                return;
            }
            if (error instanceof Error && error.name !== 'AbortError') {
                setServerError(error);
            }
        } finally {
            setIsRewriting(false);
            abortControllerRef.current = null;
        }
    }, [draft, originalMessage, handleDraftChange, focusTextbox, setServerError]);

    const handleUndo = useCallback(() => {
        if (originalMessage !== null) {
            handleDraftChange({
                ...draft,
                message: originalMessage,
            });
            setOriginalMessage(null);
            setLastAction(null);
            setLastCustomPrompt(undefined);
            focusTextbox(true);
        }
    }, [draft, originalMessage, handleDraftChange, focusTextbox]);

    const handleRegenerate = useCallback(() => {
        if (lastAction) {
            handleRewrite(lastAction, lastCustomPrompt);
        }
    }, [lastAction, lastCustomPrompt, handleRewrite]);

    const handleStopGenerating = useCallback(() => {
        if (abortControllerRef.current) {
            // eslint-disable-next-line no-console
            console.info('[Rewrite] User aborted rewrite');
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsRewriting(false);
    }, []);

    const rewriteControl = useMemo(() => (
        <RewriteMenu
            key={`rewrite-menu-${draft.channelId}`}
            disabled={disabled || !hasMessage}
            isProcessing={isRewriting}
            hasOriginalMessage={originalMessage !== null}
            onSelectAction={handleRewrite}
            onUndo={handleUndo}
            onRegenerate={handleRegenerate}
            onStopGenerating={handleStopGenerating}
        />
    ), [
        draft.channelId,
        hasMessage,
        disabled,
        isRewriting,
        originalMessage,
        handleRewrite,
        handleUndo,
        handleRegenerate,
        handleStopGenerating,
    ]);

    return {
        rewriteControl,
        isRewriting,
    };
};

export default useRewrite;
