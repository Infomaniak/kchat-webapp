// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

type Props = {
    text?: React.ReactNode;
}

const TranscriptSpinner = ({text = null}: Props) => {
    return (
        <span
            id='loadingSpinner'
            className={classNames('LoadingSpinner', {'with-text': Boolean(text)})}
            style={{fontSize: '1.5em', color: '#0098FF'}}
            data-testid='loadingSpinner'
        >
            <i
                className='fa fa-circle-o-notch fa-spin fa-3x fa-fw'
                style={{fontSize: '0.5em'}}
            />
            {text}
        </span>
    );
};

export default React.memo(TranscriptSpinner);
