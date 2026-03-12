import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {GenericModal} from '@mattermost/components';

import {getCurrentTeamAccountId} from 'mattermost-redux/selectors/entities/teams';

import {getManagerTeamsUrl} from 'utils/utils';

type Props = {
    onExited: () => void;
}

const IkRemoveGroupFromChannelModal = ({onExited}: Props) => {
    const currentTeamAccountId = useSelector(getCurrentTeamAccountId);

    const handleManage = () => {
        window.open(getManagerTeamsUrl(currentTeamAccountId), '_blank');
        onExited();
    };

    return (
        <GenericModal
            id='removeGroupFromChannelModal'
            onExited={onExited}
            handleCancel={onExited}
            handleConfirm={handleManage}
            confirmButtonText={
                <FormattedMessage
                    id='ik_remove_group_from_channel.manage'
                    defaultMessage='Manage'
                />
            }
            modalHeaderText={
                <FormattedMessage
                    id='ik_remove_group_from_channel.title'
                    defaultMessage='Remove the team from the channel'
                />
            }
            compassDesign={true}
        >
            <FormattedMessage
                id='ik_remove_group_from_channel.body'
                defaultMessage='Team access management is centralized in the Manager. Go to the dedicated team page to remove access to this channel.'
            />
        </GenericModal>
    );
};

export default IkRemoveGroupFromChannelModal;
