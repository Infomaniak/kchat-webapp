// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type React from 'react';
import {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {focusedRHS} from 'actions/views/rhs';
import {getIsRhsExpanded, getIsRhsOpen, getRhsSuppressed} from 'selectors/rhs';
import {getRhsFocusIntent} from 'selectors/views/rhs';

import useDidUpdate from 'components/common/hooks/useDidUpdate';
import type TextboxClass from 'components/textbox/textbox';

import {shouldFocusMainTextbox} from 'utils/post_utils';
import * as UserAgent from 'utils/user_agent';

const useTextboxFocus = (
    textboxRef: React.RefObject<TextboxClass>,
    channelId: string,
    isRHS: boolean,
    canPost: boolean,
) => {
    const dispatch = useDispatch();

    const hasMounted = useRef(false);

    const rhsExpanded = useSelector(getIsRhsExpanded);
    const rhsOpen = useSelector(getIsRhsOpen);
    const rhsFocusIntent = useSelector(getRhsFocusIntent);
    const rhsSuppressed = useSelector(getRhsSuppressed);
    const prevRhsSuppressed = useRef(rhsSuppressed);

    const focusTextbox = useCallback((keepFocus = false) => {
        const postTextboxDisabled = !canPost;
        if (textboxRef.current && postTextboxDisabled) {
            textboxRef.current?.blur();
            return;
        }
        if (textboxRef.current && (keepFocus || !UserAgent.isMobile())) {
            textboxRef.current?.focus();
        }
    }, [canPost, textboxRef]);

    const focusTextboxIfNecessary = useCallback((e: KeyboardEvent) => {
        // Do not focus if the rhs is expanded and this is not the RHS
        if (!isRHS && rhsExpanded) {
            return;
        }

        // Do not focus if the rhs is not expanded and this is the RHS
        if (isRHS && !rhsExpanded) {
            return;
        }

        // Do not focus the main textbox when the RHS is open as a hacky fix to avoid cursor jumping textbox sometimes
        if (isRHS && rhsOpen && document.activeElement?.tagName === 'BODY') {
            return;
        }

        // Bit of a hack to not steal focus from the channel switch modal if it's open
        // This is a special case as the channel switch modal does not enforce focus like
        // most modals do
        if (document.getElementsByClassName('channel-switch-modal').length) {
            return;
        }

        if (shouldFocusMainTextbox(e, document.activeElement)) {
            focusTextbox();
        }
    }, [focusTextbox, rhsExpanded, rhsOpen, isRHS]);

    // Register events for onkeydown
    useEffect(() => {
        document.addEventListener('keydown', focusTextboxIfNecessary);
        return () => {
            document.removeEventListener('keydown', focusTextboxIfNecessary);
        };
    }, [focusTextboxIfNecessary]);

    // IK: Focus on textbox on channel switch (center channel only)
    useDidUpdate(() => {
        if (!isRHS) {
            focusTextbox();
        }
    }, [channelId, isRHS]);

    // IK: Focus on mount based on focus intent
    useEffect(() => {
        if (isRHS) {
            if (rhsFocusIntent?.target === 'textbox') {
                focusTextbox();
                dispatch(focusedRHS());
            }
            return;
        }

        // IK: Focus main textbox on mount only if no RHS focus intent (prevents RHS from stealing focus when navigating from Threads)
        if (!rhsFocusIntent && !hasMounted.current) {
            focusTextbox();
        }

        if (!hasMounted.current) {
            hasMounted.current = true;
        }
    }, [isRHS, rhsFocusIntent, focusTextbox, dispatch]);

    // IK: Focus main textbox when leaving Threads/Drafts page (rhsSuppressed goes from true to false)
    // This handles the case where the component is already mounted and channelId doesn't change
    useEffect(() => {
        const wasSupressed = prevRhsSuppressed.current;
        prevRhsSuppressed.current = rhsSuppressed;

        if (!isRHS && wasSupressed && !rhsSuppressed && !rhsFocusIntent) {
            focusTextbox();
        }
    }, [isRHS, rhsSuppressed, rhsFocusIntent, focusTextbox]);

    return focusTextbox;
};

export default useTextboxFocus;
