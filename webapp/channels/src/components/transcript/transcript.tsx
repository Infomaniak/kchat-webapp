
import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {TranscriptData} from '@mattermost/types/transcript';

import Popover from 'components/widgets/popover';
import '../../../src/sass/components/_transcript.scss';
interface Props {
    transcriptDatas: TranscriptData;
    className?: string;
}

const TranscriptComponent: React.FC<Props> = ({transcriptDatas, ...restProps}) => {
    return (
        <div
            {...restProps}
            className='transcript-container'

        >
            <Popover className='transcript-popover'>
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
