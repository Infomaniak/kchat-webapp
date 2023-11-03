// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import type {ComponentProps} from 'react';
import React from 'react';
import {ModalIdentifiers} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import type {UserProfile} from '@mattermost/types/users';

import MoreDirectChannels from 'components/more_direct_channels/more_direct_channels';

jest.useFakeTimers();
const mockedUser = TestHelper.getUserMock();

describe('components/MoreDirectChannels', () => {
    const baseProps: ComponentProps<typeof MoreDirectChannels> = {
        currentUserId: 'current_user_id',
        currentTeamId: 'team_id',
        currentTeamName: 'team_name',
        searchTerm: '',
        totalCount: 3,
        users: [
            {
                ...mockedUser,
                id: 'user_id_1',
                delete_at: 0,
            },
            {
                ...mockedUser,
                id: 'user_id_2',
                delete_at: 0,
            },
            {
                ...mockedUser,
                id: 'user_id_3',
                delete_at: 0,
            },
        ],
        currentChannelMembers: [
            {
                ...mockedUser,
                id: 'user_id_1',
            },
            {
                ...mockedUser,
                id: 'user_id_2',
            },
        ],
        isExistingChannel: false,
        restrictDirectMessage: 'any',
        onModalDismissed: jest.fn(),
        onExited: jest.fn(),
        actions: {
            closeModal: jest.fn(),
            getProfiles: jest.fn(() => {
                return new Promise<void>((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
            getProfilesInTeam: jest.fn().mockResolvedValue({data: true}),
            loadProfilesMissingStatus: jest.fn().mockResolvedValue({data: true}),
            searchProfiles: jest.fn().mockResolvedValue({data: true}),
            searchGroupChannels: jest.fn().mockResolvedValue({data: true}),
            setModalSearchTerm: jest.fn().mockResolvedValue({data: true}),
            loadStatusesForProfilesList: jest.fn().mockResolvedValue({data: true}),
            loadProfilesForGroupChannels: jest.fn().mockResolvedValue({data: true}),
            openDirectChannelToUserId: jest.fn().mockResolvedValue({data: {name: 'dm'}}),
            openGroupChannelToUserIds: jest.fn().mockResolvedValue({data: {name: 'group'}}),
            getTotalUsersStats: jest.fn().mockImplementation(() => {
                return ((resolve: () => any) => {
                    process.nextTick(() => resolve());
                });
            }),
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps, actions: {...baseProps.actions, loadProfilesMissingStatus: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call for modal data on mount', () => {
        const props = {...baseProps, actions: {...baseProps.actions, loadProfilesMissingStatus: jest.fn()}};
        shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);

        expect(props.actions.getProfiles).toHaveBeenCalledTimes(1);
        expect(props.actions.getTotalUsersStats).toHaveBeenCalledTimes(1);
        expect(props.actions.getProfiles).toBeCalledWith(0, 100);
        expect(props.actions.loadProfilesMissingStatus).toHaveBeenCalledTimes(1);
        expect(props.actions.loadProfilesMissingStatus).toBeCalledWith(baseProps.users);
    });

    test('should call actions.loadProfilesMissingStatus on componentDidUpdate when users prop changes length', () => {
        const props = {...baseProps, actions: {...baseProps.actions, loadProfilesMissingStatus: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        const newUsers = [{
            id: 'user_id_1',
            label: 'user_id_1',
            value: 'user_id_1',
            delete_at: 0,
        }];

        wrapper.setProps({users: newUsers});
        expect(props.actions.loadProfilesMissingStatus).toHaveBeenCalledTimes(2);
        expect(props.actions.loadProfilesMissingStatus).toBeCalledWith(newUsers);
    });

    test('should match state on setUsersLoadingState', () => {
        const props = {...baseProps};
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);

        wrapper.setState({loadingUsers: true});
        wrapper.instance().setUsersLoadingState(false);
        expect(wrapper.state('loadingUsers')).toEqual(false);

        wrapper.setState({loadingUsers: false});
        wrapper.instance().setUsersLoadingState(true);
        expect(wrapper.state('loadingUsers')).toEqual(true);
    });

    test('should call on search', () => {
        jest.useFakeTimers('modern');
        const props = {...baseProps, actions: {...baseProps.actions, setModalSearchTerm: jest.fn()}};
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);
        wrapper.instance().search('user_search');
        expect(props.actions.setModalSearchTerm).not.toBeCalled();
        jest.runAllTimers();
        expect(props.actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
        expect(props.actions.setModalSearchTerm).toBeCalledWith('user_search');
    });

    test('should match state on handleDelete', () => {
        const props = {...baseProps};
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);

        const user1 = {
            ...mockedUser,
            id: 'user_id_1',
            label: 'user_id_1',
            value: 'user_id_1',
        };

        const user2 = {
            ...mockedUser,
            id: 'user_id_1',
            label: 'user_id_1',
            value: 'user_id_1',
        };

        wrapper.setState({values: [user1]});
        wrapper.instance().handleDelete([user2]);
        expect(wrapper.state('values')).toEqual([user2]);
    });

    test('should not open a DM or GM if no user Ids', () => {
        const props = {...baseProps, currentChannelMembers: []};
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);

        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(false);
        expect(baseProps.actions.openDirectChannelToUserId).not.toBeCalled();
    });

    test('should call actions.setModalSearchTerm and match state after handleSubmit', (done) => {
        jest.useFakeTimers('legacy');
        const props = {...baseProps, actions: {...baseProps.actions, setModalSearchTerm: jest.fn(), closeModal: jest.fn()}};
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);

        wrapper.instance().handleSubmit();

        expect(baseProps.actions.openGroupChannelToUserIds).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.openGroupChannelToUserIds).toHaveBeenCalledWith(['user_id_1', 'user_id_2']);
        expect(wrapper.state('saving')).toEqual(true);

        process.nextTick(() => {
            expect(wrapper.state('saving')).toEqual(false);
            expect(props.actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
            expect(props.actions.setModalSearchTerm).toBeCalledWith('');
            expect(props.actions.closeModal).toHaveBeenCalledTimes(1);
            expect(props.actions.closeModal).toBeCalledWith(ModalIdentifiers.CREATE_DM_CHANNEL);
            done();
        });
    });

    test('should open a DM', (done) => {
        jest.useFakeTimers('legacy');
        const user: UserProfile = {
            ...mockedUser,
            id: 'user_id_1',
        };
        const props = {...baseProps, currentChannelMembers: [user]};
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);
        const exitToChannel = '';

        wrapper.instance().exitToChannel = exitToChannel;
        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(true);
        expect(props.actions.openDirectChannelToUserId).toHaveBeenCalledTimes(1);
        expect(props.actions.openDirectChannelToUserId).toHaveBeenCalledWith('user_id_1');
        process.nextTick(() => {
            expect(wrapper.state('saving')).toEqual(false);
            expect(wrapper.instance().exitToChannel).toEqual(`/${props.currentTeamName}/channels/dm`);
            done();
        });
    });

    test('should open a GM', (done) => {
        jest.useFakeTimers('legacy');
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...baseProps}/>);
        const exitToChannel = '';

        wrapper.instance().exitToChannel = exitToChannel;
        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(true);
        expect(baseProps.actions.openGroupChannelToUserIds).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.openGroupChannelToUserIds).toHaveBeenCalledWith(['user_id_1', 'user_id_2']);
        process.nextTick(() => {
            expect(wrapper.state('saving')).toEqual(false);
            expect(wrapper.instance().exitToChannel).toEqual(`/${baseProps.currentTeamName}/channels/group`);
            done();
        });
    });

    test('should exclude deleted users if there is not direct channel between users', () => {
        const users: UserProfile[] = [
            {
                ...mockedUser,
                id: 'user_id_1',
                delete_at: 0,
            },
            {
                ...mockedUser,
                id: 'user_id_2',
                delete_at: 0,
            },
            {
                ...mockedUser,
                id: 'deleted_user_1',
                delete_at: 1,
            },
            {
                ...mockedUser,
                id: 'deleted_user_2',
                delete_at: 1,
            },
            {
                ...mockedUser,
                id: 'deleted_user_3',
                delete_at: 1,
            },
        ];
        const myDirectChannels = [
            {name: 'deleted_user_1__current_user_id'},
            {name: 'not_existent_user_1__current_user_id'},
            {name: 'current_user_id__deleted_user_2'},
        ];
        const currentChannelMembers: UserProfile[] = [];
        const props = {...baseProps, users, myDirectChannels, currentChannelMembers};
        const wrapper = shallow<MoreDirectChannels>(<MoreDirectChannels {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
