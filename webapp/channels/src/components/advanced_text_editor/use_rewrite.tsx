// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useRef, useState} from 'react';

import {Client4} from 'mattermost-redux/client';

import type {PostDraft} from 'types/store/draft';

import type {RewriteAction} from './rewrite_action';
import RewriteMenu from './rewrite_menu';

import './use_rewrite.scss';

interface UseRewriteParams {
    draft: PostDraft;
    handleDraftChange: (draft: PostDraft, options?: {instant?: boolean; show?: boolean}) => void;
    focusTextbox: (keepFocus?: boolean) => void;
    setServerError: (error: Error | null) => void;
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
    disabled = false,
}: UseRewriteParams): UseRewriteResult => {
    const [isRewriting, setIsRewriting] = useState(false);
    const [originalMessage, setOriginalMessage] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<RewriteAction | null>(null);
    const [lastCustomPrompt, setLastCustomPrompt] = useState<string | undefined>(undefined);
    const abortControllerRef = useRef<AbortController | null>(null);

    const hasMessage = Boolean(draft.message.trim());

    const handleRewrite = useCallback(async (action: RewriteAction, customPrompt?: string) => {
        if (!draft.message.trim()) {
            return;
        }

        if (originalMessage === null) {
            setOriginalMessage(draft.message);
        }

        setIsRewriting(true);
        setLastAction(action);
        setLastCustomPrompt(customPrompt);

        abortControllerRef.current = new AbortController();

        try {
            const rewrittenMessage = await Client4.getAIRewrittenMessage(
                draft.message,
                action,
                customPrompt,
            );

            handleDraftChange({
                ...draft,
                message: rewrittenMessage,
            });
            focusTextbox(true);
        } catch (error) {
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
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsRewriting(false);
    }, []);

    const rewriteControl = useMemo(() => (
        <RewriteMenu
            key='rewrite-menu'
            disabled={disabled || !hasMessage}
            isProcessing={isRewriting}
            hasOriginalMessage={originalMessage !== null}
            onSelectAction={handleRewrite}
            onUndo={handleUndo}
            onRegenerate={handleRegenerate}
            onStopGenerating={handleStopGenerating}
        />
    ), [
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
