
import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {OptionValue} from 'components/more_direct_channels/types';

import Constants from 'utils/constants';

interface Props {
    values: OptionValue[];
    openModal: () => void;
}

const CreateChannelTip: React.FC<Props> = ({values, openModal}) => {
    const lampIcon = () => Constants.LAMP_ICON;

    return (
        (values.length >= (Constants.MAX_USERS_IN_GM - 1)) ? (
            <div className='create-new-channel'>
                <img src={lampIcon()}/>
                <FormattedMessage
                    id='multiselect.new_channel'
                    defaultMessage='Create a channel to communicate with more people'
                />
                <a
                    href='#'
                    onClick={(e) => {
                        e.preventDefault();
                        openModal();
                    }}
                >
                    <FormattedMessage
                        id='multiselect.new_channel_create'
                        defaultMessage='Create a channel'
                    />
                </a>
            </div>

        ) : null

    );
};

export default CreateChannelTip;
