// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Utility for retrying async operations with exponential backoff and optional jitter.
 * Inspired by https://github.com/coveooss/exponential-backoff
 */

/**
 * Jitter strategy applied to the computed delay.
 * - 'none': no randomization, exact exponential delay
 * - 'full': random value uniformly distributed between 0 and the exponential delay (AWS recommendation)
 */
export type JitterType = 'none' | 'full';

export interface BackOffOptions {

    /**
     * Total number of attempts, including the first one.
     * @defaultValue 10
     */
    numOfAttempts?: number;

    /**
     * Delay in milliseconds applied before the first retry.
     * @defaultValue 100
     */
    startingDelay?: number;

    /**
     * Multiplier applied to the delay between each retry.
     * @defaultValue 2
     */
    timeMultiple?: number;

    /**
     * Upper bound on the delay in milliseconds.
     * @defaultValue Infinity
     */
    maxDelay?: number;

    /**
     * Jitter strategy applied to the computed delay.
     * @defaultValue 'none'
     */
    jitter?: JitterType;

    /**
     * Called after each failed attempt (except the last one).
     * Return false to abort retries early.
     * @param err The error thrown by the last attempt.
     * @param attemptNumber 1-based index of the failed attempt.
     * @param nextDelay The delay in ms that will be applied before the next attempt.
     * @defaultValue always returns true
     */
    retry?: (err: unknown, attemptNumber: number, nextDelay: number) => boolean | Promise<boolean>;
}

function computeDelay(
    startingDelay: number,
    timeMultiple: number,
    maxDelay: number,
    jitter: JitterType,
    failedAttemptIndex: number,
): number {
    const exponentialDelay = Math.min(
        startingDelay * Math.pow(timeMultiple, failedAttemptIndex),
        maxDelay,
    );
    if (jitter === 'full') {
        return Math.round(Math.random() * exponentialDelay);
    }
    return exponentialDelay;
}

export async function backOff<T>(
    request: () => Promise<T>,
    options: BackOffOptions = {},
): Promise<T> {
    const numOfAttempts = Math.max(1, options.numOfAttempts ?? 10);
    const startingDelay = options.startingDelay ?? 100;
    const timeMultiple = options.timeMultiple ?? 2;
    const maxDelay = options.maxDelay ?? Infinity;
    const jitter = options.jitter ?? 'none';
    const retry = options.retry ?? (() => true);

    for (let i = 0; i < numOfAttempts; i++) {
        try {
            return await request(); // eslint-disable-line no-await-in-loop
        } catch (err) {
            const isLastAttempt = i >= numOfAttempts - 1;
            if (isLastAttempt) {
                throw err;
            }

            const delay = computeDelay(startingDelay, timeMultiple, maxDelay, jitter, i);
            const shouldRetry = await retry(err, i + 1, delay); // eslint-disable-line no-await-in-loop
            if (!shouldRetry) {
                throw err;
            }

            const actualDelay = process.env.NODE_ENV === 'test' ? 0 : delay;
            await new Promise<void>((resolve) => setTimeout(resolve, actualDelay)); // eslint-disable-line no-await-in-loop
        }
    }

    // Unreachable, but satisfies the TypeScript compiler
    throw new Error('backOff: exhausted all attempts.');
}
