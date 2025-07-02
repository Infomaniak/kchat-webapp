// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import {FolderPlusOutlineIcon} from '@mattermost/compass-icons/components';

import {withQuotaControl} from 'mattermost-redux/utils/plans_util';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import {useNextPlan} from 'components/common/hooks/useNextPlan';
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
    const handleCreateCategory = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        }));
        trackEvent('ui', 'ui_sidebar_category_menu_createCategory');
    }, [dispatch]);

    const enabled = (
        <FormattedMessage
            id='sidebar_left.sidebar_category_menu.createCategory'
            defaultMessage='Create New Category'
        />
    );

    const nextPlan = useNextPlan();
    const disabled = (
        <wc-ksuite-pro-upgrade-dialog offer={nextPlan}>
            <div
                slot='trigger-element'
                style={{display: 'flex', alignItems: 'center', gap: '8px'}}
            >
                {enabled}
                <wc-ksuite-pro-upgrade-tag/>
            </div>
        </wc-ksuite-pro-upgrade-dialog>

    );
    const {sidebar_categories: sidebarCategories} = useGetUsageDeltas();

    const {component, onClick} = withQuotaControl(sidebarCategories, enabled, disabled, handleCreateCategory);

    return (
        <Menu.Item
            id={`create-${id}`}
            onClick={onClick}
            aria-haspopup={sidebarCategories >= 0}
            aria-expanded={sidebarCategories >= 0}
            leadingElement={<FolderPlusOutlineIcon size={18}/>}
            labels={component}
            {...otherProps}
        />
    );
};

export default CreateNewCategoryMenuItem;
