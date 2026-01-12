import React from 'react';
import {FormattedMessage} from 'react-intl';

import IconThreadSummarization from './assets/icon_thread_summarization';

const ThreadSummarizeMenuItem = (
    <>
        <span className='icon'>
            <IconThreadSummarization/>
        </span>
        <FormattedMessage defaultMessage='Summarize Thread'/>
    </>
);

export default ThreadSummarizeMenuItem;
