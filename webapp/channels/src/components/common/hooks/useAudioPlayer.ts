// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState, useMemo} from 'react';

import {isIosWeb} from 'utils/user_agent';

export enum AudioPlayerState {
    Playing = 'PLAYING',
    Paused = 'PAUSED',
    Stopped = 'STOPPED',
}

export function useAudioPlayer(src?: string) {
    const [playerState, setPlayerState] = useState<AudioPlayerState>(AudioPlayerState.Stopped);
    const [duration, setDuration] = useState(0);
    const [elapsed, setElapsedTime] = useState(0);

    // Create audio element with given audio source
    const audio = useMemo(() => new Audio(src), [src]);

    // Add event listeners to audio element
    useEffect(() => {
        let elapsedTimeRafId: number;

        function onEnded() {
            setPlayerState(AudioPlayerState.Stopped);
            audio.currentTime = 0;
            setElapsedTime(0);
        }

        function onLoadedData() {
            if (audio.duration === Infinity || isNaN(Number(audio.duration))) {
                audio.currentTime = 1e101;
                return;
            }
            setDuration(audio.duration);
            audio.currentTime = 0;
            setElapsedTime(0);
        }

        function onTimeUpdate(event: any) {
            if (duration !== event.target.duration) {
                setDuration(event.target.duration);
                setElapsedTime(0);
            }
            elapsedTimeRafId = requestAnimationFrame(() => {
                setElapsedTime(audio.currentTime);
            });
        }

        audio.addEventListener('ended', onEnded);
        audio.addEventListener('loadeddata', onLoadedData);
        audio.addEventListener('timeupdate', onTimeUpdate);

        return () => {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('loadeddata', onLoadedData);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            cancelAnimationFrame(elapsedTimeRafId);
        };
    }, [audio]);

    function togglePlayPause() {
        if (audio && (audio.readyState === 4 || (isIosWeb() && audio.readyState === 1))) {
            const isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended;
            if (isPlaying) {
                audio.pause();
                setPlayerState(AudioPlayerState.Paused);
            } else {
                audio.play();
                setPlayerState(AudioPlayerState.Playing);
            }
        }
    }

    return {
        playerState,
        duration,
        elapsed,
        togglePlayPause,
    };
}
