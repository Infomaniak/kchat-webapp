
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {FormattedMessage} from 'react-intl';

import type {TranscriptData} from '@mattermost/types/transcript';

import Popover from 'components/widgets/popover';

import '../../../src/sass/components/_transcript.scss';

interface Props {
    transcriptDatas: TranscriptData;
    className?: string;
    clickPosition?: {x: number; y: number};
    elementRef: React.RefObject<Element>;
}

const usePopoverPosition = (elementRef: React.RefObject<Element>, tooltipHeight: number) => {
    const [positionStyle, setPositionStyle] = useState<{ top: number; left: number }>({top: 0, left: 0});

    const getOffsetTop = (height: number) => {
        if (height <= 50) {
            return 100;
        } else if (height < 400 && height > 50) {
            return 200;
        }
        return 300;
    };

    const getOffsetRight = (height: number) => {
        if (height <= 50) {
            return 400;
        } else if (height < 400 && height > 50) {
            return 300;
        }
        return 400;
    };

    const updatePosition = useCallback(() => {
        const {top, right} = elementRef.current!.getBoundingClientRect();
        const isAboveMiddleScreen = top < window.innerHeight / 2;
        const isLeftOfMiddleScreen = right < window.innerWidth / 2;
        const offsetTop = getOffsetTop(tooltipHeight);
        const offsetRight = getOffsetRight(tooltipHeight);

        setPositionStyle({
            top: Math.max(0, isAboveMiddleScreen ? top : (top - offsetTop)),
            left: Math.max(0, isLeftOfMiddleScreen ? right : (right - offsetRight)),
        });
    }, [elementRef, tooltipHeight]);

    useEffect(() => {
        window.addEventListener('resize', updatePosition);
        updatePosition();

        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, [updatePosition]);

    return positionStyle;
};

const TranscriptComponent: React.FC<Props> = ({className, transcriptDatas, elementRef, ...restProps}) => {
    const compRef = useRef<HTMLDivElement>(null);

    const [tooltipHeight, setTooltipHeight] = useState(0);

    useLayoutEffect(() => {
        const {height} = compRef.current!.getBoundingClientRect();
        setTooltipHeight(height);
    }, []);

    return createPortal(
        <Popover
            className='transcript-popover'
            style={{
                ...usePopoverPosition(elementRef, tooltipHeight),
            }}
        >
            <div
                {...restProps}
                className={className}

            >
                <div
                    ref={compRef}
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
                </div>
            </div>

        </Popover>, document.getElementById('root') as HTMLElement,
    );
};

export default React.memo(TranscriptComponent);
