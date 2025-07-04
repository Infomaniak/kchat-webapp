// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {FolderPlusOutlineIcon} from '@mattermost/compass-icons/components';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {quotaGate} from 'mattermost-redux/utils/plans_util';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import EditCategoryModal from 'components/edit_category_modal';
import * as Menu from 'components/menu';

import {ModalIdentifiers} from 'utils/constants';

type Props = {
    id: string;
}

const CreateNewCategoryMenuItem = ({
    id,
    ...otherProps
}: Props) => {
    const dispatch = useDispatch();
    const currentPack = useSelector(getCurrentPackName);
    const handleCreateCategory = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        }));
        trackEvent('ui', 'ui_sidebar_category_menu_createCategory');
    }, [dispatch]);

    const {sidebar_categories: sidebarCategories} = useGetUsageDeltas();

    const {isQuotaExceeded, withQuotaCheck} = quotaGate(sidebarCategories, currentPack);

    return (
        <Menu.Item
            id={`create-${id}`}
            onClick={withQuotaCheck(handleCreateCategory)}
            leadingElement={<FolderPlusOutlineIcon size={18}/>}
            labels={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <FormattedMessage
                        id='sidebar_left.sidebar_category_menu.createCategory'
                        defaultMessage='Create New Category'
                    />
                    {isQuotaExceeded && <wc-ksuite-pro-upgrade-tag/>}
                </div>
            }
            {...otherProps}
        />
    );
};

export default CreateNewCategoryMenuItem;
