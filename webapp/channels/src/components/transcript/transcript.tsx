
import cx from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import type {TranscriptData} from '@mattermost/types/transcript';

import Popover from 'components/widgets/popover';

import '../../../src/sass/components/_transcript.scss';

interface Props {
    transcriptDatas: TranscriptData;
    className?: string;
    clickPosition?: {x: number; y: number};
    elementRef: React.RefObject<HTMLAnchorElement>;
}

const usePopoverPosition = (elementRef: React.RefObject<Element>) => {
    const [positionStyle, setPositionStyle] = useState<{ top: number; left: number }>({top: 0, left: 0});

    const updatePosition = useCallback(() => {
        const {top, right} = elementRef.current!.getBoundingClientRect();
        const isAboveMiddleScreen = top < window.innerHeight / 2;
        const isLeftOfMiddleScreen = right < window.innerWidth / 2;

        setPositionStyle({
            top: Math.max(0, isAboveMiddleScreen ? top : (top - 400)),
            left: Math.max(0, isLeftOfMiddleScreen ? right : (right - 400)),
        });
    }, []);

    useEffect(() => {
        window.addEventListener('resize', updatePosition);
        updatePosition();

        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, []);

    return positionStyle;
};

const TranscriptComponent: React.FC<Props> = ({transcriptDatas, elementRef, className, ...restProps}) => {
    return (
        <div
            {...restProps}
            className={cx(className, 'transcript-container')}
        >
            <Popover
                className='transcript-popover'
                style={usePopoverPosition(elementRef)}
            >
                <div className='transcript-text'>
                    <FormattedMessage
                        id='vocals.transcript_title'
                        defaultMessage='Audio Transcript (auto-generated)'
                    />
                </div>
                <div >
                    {transcriptDatas.segments.map((segment, index) => {
                        const minutes = Math.floor(segment.start / 60);
                        const seconds = Math.floor(segment.start % 60);
                        const time = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                        return (
                            <div
                            // eslint-disable-next-line react/no-array-index-key
                                key={index}
                            >
                                <p>
                                    <span className='time-transcript'>
                                        {time}
                                    </span>
                                    {''}
                                    {` ${segment.text.trim()}`}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </Popover>
        </div>
    );
};

export default React.memo(TranscriptComponent);
