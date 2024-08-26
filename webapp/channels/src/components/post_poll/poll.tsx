import {ChartBarIcon} from '@infomaniak/compass-icons/components';
import React, {memo, useCallback} from 'react';
import {useIntl} from 'react-intl';

import {IconContainer} from 'components/advanced_text_editor/formatting_bar/formatting_icon';
import useTooltip from 'components/common/hooks/useTooltip';

type Props = {
    rootId?: string;
    disabled: boolean;
    currentChannelId: string;
    actions:
    { submitImmediateCommand: (channelId: string, command: string, rootId: string) => void};

};

function Poll({
    disabled,
    currentChannelId,
    actions: {submitImmediateCommand},
    rootId,
}: Props) {
    const {formatMessage} = useIntl();

    const pollMessage = formatMessage({id: 'shortcuts.msgs.formatting_bar.poll', defaultMessage: 'Lancer un sondage'});
    const {
        setReference: setTooltipRef,
        getReferenceProps: getTooltipReferenceProps,
        tooltip,
    } = useTooltip({
        placement: 'top',
        message: pollMessage,
    });

    const handleClick = useCallback(() => {
        submitImmediateCommand(currentChannelId, '/poll', rootId ?? '');
    }, [currentChannelId, submitImmediateCommand]);

    return (
        <>
            <div
                ref={setTooltipRef}
                {...getTooltipReferenceProps()}
            >
                <IconContainer
                    id='messagePriority'
                    disabled={disabled}
                    type='button'
                    aria-label={pollMessage}
                    onClick={handleClick}
                >
                    <ChartBarIcon
                        size={18}
                        color='currentColor'
                    />
                </IconContainer>
            </div>

            {tooltip}
        </>
    );
}

export default memo(Poll);
