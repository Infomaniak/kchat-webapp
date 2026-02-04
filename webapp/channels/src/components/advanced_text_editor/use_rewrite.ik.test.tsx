// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RewriteAction} from './rewrite_action';

describe('RewriteAction enum', () => {
    it('should have all expected rewrite actions', () => {
        expect(RewriteAction.SHORTEN).toBe('shorten');
        expect(RewriteAction.ELABORATE).toBe('elaborate');
        expect(RewriteAction.IMPROVE_WRITING).toBe('improve_writing');
        expect(RewriteAction.FIX_SPELLING).toBe('fix_spelling');
        expect(RewriteAction.SIMPLIFY).toBe('simplify');
        expect(RewriteAction.SUMMARIZE).toBe('summarize');
        expect(RewriteAction.CUSTOM).toBe('custom');
    });

    it('should have exactly 7 actions', () => {
        const actions = Object.values(RewriteAction);
        expect(actions).toHaveLength(7);
    });
});

describe('useRewrite hook logic', () => {
    interface RewriteState {
        isRewriting: boolean;
        originalMessage: string | null;
        lastAction: RewriteAction | null;
        lastCustomPrompt: string | undefined;
    }

    const createInitialState = (): RewriteState => ({
        isRewriting: false,
        originalMessage: null,
        lastAction: null,
        lastCustomPrompt: undefined,
    });

    it('should preserve original message on first rewrite', () => {
        const state = createInitialState();
        const currentMessage = 'Hello world';

        if (state.originalMessage === null) {
            state.originalMessage = currentMessage;
        }

        expect(state.originalMessage).toBe('Hello world');
    });

    it('should not overwrite original message on subsequent rewrites', () => {
        const state: RewriteState = {
            isRewriting: false,
            originalMessage: 'Original text',
            lastAction: RewriteAction.IMPROVE_WRITING,
            lastCustomPrompt: undefined,
        };

        const newMessage = 'Improved text';

        if (state.originalMessage === null) {
            state.originalMessage = newMessage;
        }

        expect(state.originalMessage).toBe('Original text');
    });

    it('should track last action for regeneration', () => {
        const state = createInitialState();

        state.lastAction = RewriteAction.SHORTEN;

        expect(state.lastAction).toBe(RewriteAction.SHORTEN);
    });

    it('should track custom prompt for regeneration', () => {
        const state = createInitialState();

        state.lastAction = RewriteAction.CUSTOM;
        state.lastCustomPrompt = 'Make it more formal';

        expect(state.lastAction).toBe(RewriteAction.CUSTOM);
        expect(state.lastCustomPrompt).toBe('Make it more formal');
    });

    it('should reset state on undo', () => {
        const state: RewriteState = {
            isRewriting: false,
            originalMessage: 'Original text',
            lastAction: RewriteAction.ELABORATE,
            lastCustomPrompt: undefined,
        };

        state.originalMessage = null;
        state.lastAction = null;
        state.lastCustomPrompt = undefined;

        expect(state.originalMessage).toBeNull();
        expect(state.lastAction).toBeNull();
        expect(state.lastCustomPrompt).toBeUndefined();
    });

    it('should not show rewrite control when message is empty', () => {
        const draft = {message: ''};
        const isRewriting = false;
        const hasMessage = Boolean(draft.message.trim());

        const shouldShowControl = hasMessage || isRewriting;

        expect(shouldShowControl).toBe(false);
    });

    it('should show rewrite control when message has content', () => {
        const draft = {message: 'Some text'};
        const isRewriting = false;
        const hasMessage = Boolean(draft.message.trim());

        const shouldShowControl = hasMessage || isRewriting;

        expect(shouldShowControl).toBe(true);
    });

    it('should show rewrite control when rewriting even if message is empty', () => {
        const draft = {message: ''};
        const isRewriting = true;
        const hasMessage = Boolean(draft.message.trim());

        const shouldShowControl = hasMessage || isRewriting;

        expect(shouldShowControl).toBe(true);
    });

    it('should disable control when in preview mode', () => {
        const showPreview = true;
        const isDisabled = false;

        const controlDisabled = showPreview || isDisabled;

        expect(controlDisabled).toBe(true);
    });

    it('should disable control when editor is disabled', () => {
        const showPreview = false;
        const isDisabled = true;

        const controlDisabled = showPreview || isDisabled;

        expect(controlDisabled).toBe(true);
    });
});

describe('RewriteMenu state logic', () => {
    it('should determine if undo is available based on original message', () => {
        const originalMessage: string | null = 'Original';
        const hasOriginalMessage = originalMessage !== null;

        expect(hasOriginalMessage).toBe(true);
    });

    it('should not allow undo when no original message', () => {
        const originalMessage: string | null = null;
        const hasOriginalMessage = originalMessage !== null;

        expect(hasOriginalMessage).toBe(false);
    });

    it('should trim custom prompt before submission', () => {
        const customPrompt = '  Make it formal  ';
        const trimmedPrompt = customPrompt.trim();

        expect(trimmedPrompt).toBe('Make it formal');
    });

    it('should not submit empty custom prompt', () => {
        const customPrompt = '   ';
        const shouldSubmit = Boolean(customPrompt.trim());

        expect(shouldSubmit).toBe(false);
    });
});

describe('Abort controller logic', () => {
    it('should not update draft when abort signal is triggered', () => {
        const abortController = new AbortController();
        let draftUpdated = false;

        const handleDraftChange = () => {
            if (!abortController.signal.aborted) {
                draftUpdated = true;
            }
        };

        abortController.abort();

        handleDraftChange();

        expect(abortController.signal.aborted).toBe(true);
        expect(draftUpdated).toBe(false);
    });

    it('should update draft when abort signal is not triggered', () => {
        const abortController = new AbortController();
        let draftUpdated = false;

        const handleDraftChange = () => {
            if (!abortController.signal.aborted) {
                draftUpdated = true;
            }
        };

        handleDraftChange();

        expect(abortController.signal.aborted).toBe(false);
        expect(draftUpdated).toBe(true);
    });
});
