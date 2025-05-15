// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useRef, useState} from 'react';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';

import WithTooltip from 'components/with_tooltip';

import {copyToClipboard} from 'utils/utils';

type AllMessageKeys = Exclude<keyof typeof messages, 'copied'>;
type CopyType = AllMessageKeys extends `copy${infer Suffix}` ? Lowercase<Suffix> : never;

type Props = {
    content: string;
    isFor?: CopyType;
    className?: string;
};

const CopyButton: React.FC<Props> = (props: Props) => {
    const intl = useIntl();

    const [isCopied, setIsCopied] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const copyText = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
        e.preventDefault();
        setIsCopied(true);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setIsCopied(false);
        }, 2000);

        copyToClipboard(props.content);
    };

    let tooltipMessage;
    if (isCopied) {
        tooltipMessage = messages.copied;
    } else {
        switch (props.isFor) {
        case 'text':
            tooltipMessage = messages.copyText;
            break;
        case 'id' :
            tooltipMessage = messages.copyId;
            break;
        case 'code':
        default:
            tooltipMessage = messages.copyCode;
        }
    }

    const tooltipText = (
        <FormattedMessage {...tooltipMessage}/>
    );

    const spanClassName = classNames('post-code__clipboard', props.className);

    return (
        <WithTooltip
            title={tooltipText}
        >
            <span
                className={spanClassName}
                onClick={copyText}
                aria-label={intl.formatMessage(tooltipMessage)}
                role='button'
            >
                {!isCopied &&
                    <i
                        className='icon icon-content-copy'
                    />
                }
                {isCopied &&
                    <i
                        className='icon icon-check'
                    />
                }
            </span>
        </WithTooltip>
    );
};

const messages = defineMessages({
    copied: {
        id: 'copied.message',
        defaultMessage: 'Copied',
    },
    copyCode: {
        id: 'copy.code.message',
        defaultMessage: 'Copy code',
    },
    copyText: {
        id: 'copy.text.message',
        defaultMessage: 'Copy text',
    },
    copyId: { //IK: custom
        id: 'copy.text.userid',
        defaultMessage: 'Copy user ID',
    },
});

export default CopyButton;
