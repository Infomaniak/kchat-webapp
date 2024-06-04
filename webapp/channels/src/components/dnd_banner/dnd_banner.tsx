import {BellOffOutlineIcon} from '@infomaniak/compass-icons/components';
import classNames from 'classnames';
import React from 'react';
import type {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import TextBanner from 'components/text_banner';

import type {GuestBannerConnectorProps} from '.';
import './dnd_banner.scss';

export type Props = GuestBannerConnectorProps & {
    shouldDisplay: boolean;
    name?: string;
}

const DndBanner: FC<Props> = ({shouldDisplay, name}) => {
    return (
        shouldDisplay && name ? <TextBanner className={classNames('DndBanner')}>
            <BellOffOutlineIcon className={'InfoIcon'}/>
            <FormattedMessage
                id='dnd_banner.text'
                defaultMessage='There {slot} in this conversation.'
                values={{name}}

            />
        </TextBanner> : <></>
    );
};

export default DndBanner;
