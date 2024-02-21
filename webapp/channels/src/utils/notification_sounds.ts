// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import bing from 'sounds/bing.mp3';
import crackle from 'sounds/crackle.mp3';
import down from 'sounds/down.mp3';
import hello from 'sounds/hello.mp3';
import ring from 'sounds/ring.mp3';
import ripple from 'sounds/ripple.mp3';
import * as UserAgent from 'utils/user_agent';

export const notificationSounds = new Map([
    ['Bing', bing],
    ['Crackle', crackle],
    ['Down', down],
    ['Hello', hello],
    ['Ripple', ripple],

]);

export const callsNotificationSounds = new Map([
    ['Ring', ring],
]);

let currentRing: HTMLAudioElement | null = null;
export function ringing(name: string) {
    if (!hasSoundOptions()) {
        return;
    }
    stopRing();

    currentRing = loopNotificationRing(name);
    currentRing.muted = false;
    const promise = currentRing.play();

    currentRing.addEventListener('pause', () => {
        stopRing();
    });
    if (promise !== undefined) {
        promise.then(() => {}).catch(console.error);
    }
}

export function stopRing() {
    if (currentRing) {
        currentRing.pause();
        currentRing.src = '';
        currentRing.remove();
        currentRing = null;
    }
}

let currentTryRing: HTMLAudioElement | null = null;
let currentTimer: NodeJS.Timeout;
export function tryNotificationRing(name: string) {
    if (!hasSoundOptions()) {
        return;
    }
    stopTryNotificationRing();
    clearTimeout(currentTimer);

    currentTryRing = loopNotificationRing(name);
    currentTryRing.addEventListener('pause', () => {
        stopTryNotificationRing();
    });

    currentTimer = setTimeout(() => {
        stopTryNotificationRing();
    }, 5000);
}

export function stopTryNotificationRing() {
    if (currentTryRing) {
        currentTryRing.pause();
        currentTryRing.src = '';
        currentTryRing.remove();
        currentTryRing = null;
    }
}

export function loopNotificationRing(name: string) {
    const audio = new Audio(callsNotificationSounds.get(name) ?? callsNotificationSounds.get('Ring'));
    audio.muted = true;
    audio.loop = true;
    return audio;
}

export function hasSoundOptions() {
    return (!UserAgent.isEdge());
}

let canDing = true;
export function ding(name: string) {
    if (hasSoundOptions() && canDing) {
        tryNotificationSound(name);
        canDing = false;
        setTimeout(() => {
            canDing = true;
        }, 3000);
    }
}

export function tryNotificationSound(name: string) {
    const audio = new Audio(notificationSounds.get(name) ?? notificationSounds.get('Bing'));
    try {
        audio.play();
    } catch {
        // Prevent the issue "DOMException: play() failed because the user didn't interact with the document first."
        // Due to user gesture permissions: https://developer.chrome.com/blog/autoplay/
    }
}
