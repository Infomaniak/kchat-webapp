// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Flex from '@infomaniak/compass-components/utilities/layout/Flex';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Constants,
    RHSStates,
} from 'utils/constants';
import * as Utils from 'utils/utils';

import {closeRightHandSide, showMentions} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';

import Search from 'components/search';

import type {GlobalState} from 'types/store';

const GlobalSearchNav = (): JSX.Element => {
    const dispatch = useDispatch();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));

    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
                if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                    e.preventDefault();
                    if (rhsState === RHSStates.MENTION) {
                        dispatch(closeRightHandSide());
                    } else {
                        dispatch(showMentions());
                    }
                }
            }
        };

        document.addEventListener('keydown', handleShortcut);
        return () => {
            document.removeEventListener('keydown', handleShortcut);
        };
    }, [rhsState, dispatch]);

    return (
        <Flex
            row={true}
            width={432}
            flex={1}
            alignment='center'
        >
            <Search
                enableFindShortcut={true}
            />
        </Flex>
    );
};

export default GlobalSearchNav;
