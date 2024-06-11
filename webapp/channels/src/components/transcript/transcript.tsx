
import Popover from '@mui/material/Popover';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {TranscriptData} from '@mattermost/types/transcript';

import '../../../src/sass/components/_transcript.scss';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import CompassDesignProvider from 'components/compass_design_provider';

interface Props {
    transcriptDatas: TranscriptData;
    anchorEl: Element | null;
    handleClose: () => void;
    open: boolean;
}

const TranscriptComponent: React.FC<Props> = ({transcriptDatas, anchorEl, handleClose, open}) => {
    const theme = useSelector(getTheme);
    const id = open ? 'simple-popover' : undefined;

    return (
        <CompassDesignProvider theme={theme}>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <div className='transcript-popover'>
                    <div className='transcript-text'>
                        <FormattedMessage
                            id='vocals.transcript_title'
                            defaultMessage='Audio Transcript (auto-generated)'
                        />
                    </div>
                    <div>
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
            </Popover>
        </CompassDesignProvider>
    );
};

export default React.memo(TranscriptComponent);
