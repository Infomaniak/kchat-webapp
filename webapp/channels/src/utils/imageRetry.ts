// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Shared handler for img onError with a single automatic retry.
 * On first error, calls onRetry (e.g. increment retryCount to remount the img).
 * On second error, calls onError (e.g. mark as errored or do nothing for native fallback).
 */
export function handleImageErrorWithRetry(
    mounted: boolean,
    retryCount: number,
    onRetry: () => void,
    onError: () => void,
): void {
    if (!mounted) {
        return;
    }
    if (retryCount === 0) {
        onRetry();
    } else {
        onError();
    }
}
