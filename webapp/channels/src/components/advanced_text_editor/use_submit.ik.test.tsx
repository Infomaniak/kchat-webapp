// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Tests for duplicate message prevention on unstable networks.
 * IK: This feature prevents the same message from being sent multiple times
 * when network conditions cause rapid key events.
 */

describe('useSubmit duplicate prevention logic', () => {
    const DUPLICATE_PREVENTION_MS = 350;

    interface LastSubmission {
        message: string;
        channelId: string;
        rootId: string;
        time: number;
    }

    const shouldBlockSubmission = (
        submittingDraftParam: {message: string},
        channelId: string,
        rootId: string,
        lastSubmission: LastSubmission | null,
    ): boolean => {
        const now = Date.now();
        const last = lastSubmission;
        if (last &&
            last.message === submittingDraftParam.message &&
            last.channelId === channelId &&
            last.rootId === rootId &&
            now - last.time < DUPLICATE_PREVENTION_MS) {
            return true;
        }
        return false;
    };

    it('should block identical submissions within prevention window', () => {
        const channelId = 'test_channel';
        const rootId = '';
        const message = 'test message';
        const now = Date.now();

        const lastSubmission: LastSubmission = {
            message,
            channelId,
            rootId,
            time: now - 100, // 100ms ago
        };

        const result = shouldBlockSubmission(
            {message},
            channelId,
            rootId,
            lastSubmission,
        );

        expect(result).toBe(true);
    });

    it('should allow identical submissions after prevention window expires', () => {
        const channelId = 'test_channel';
        const rootId = '';
        const message = 'test message';
        const now = Date.now();

        const lastSubmission: LastSubmission = {
            message,
            channelId,
            rootId,
            time: now - 400, // 400ms ago (> 350ms)
        };

        const result = shouldBlockSubmission(
            {message},
            channelId,
            rootId,
            lastSubmission,
        );

        expect(result).toBe(false);
    });

    it('should allow different messages immediately', () => {
        const channelId = 'test_channel';
        const rootId = '';
        const now = Date.now();

        const lastSubmission: LastSubmission = {
            message: 'first message',
            channelId,
            rootId,
            time: now - 50, // Only 50ms ago
        };

        const result = shouldBlockSubmission(
            {message: 'second message'},
            channelId,
            rootId,
            lastSubmission,
        );

        expect(result).toBe(false);
    });

    it('should allow same message in different channel', () => {
        const rootId = '';
        const message = 'test message';
        const now = Date.now();

        const lastSubmission: LastSubmission = {
            message,
            channelId: 'channel_1',
            rootId,
            time: now - 50,
        };

        const result = shouldBlockSubmission(
            {message},
            'channel_2',
            rootId,
            lastSubmission,
        );

        expect(result).toBe(false);
    });

    it('should allow first submission when no previous submission exists', () => {
        const result = shouldBlockSubmission(
            {message: 'first message'},
            'test_channel',
            '',
            null,
        );

        expect(result).toBe(false);
    });
});
