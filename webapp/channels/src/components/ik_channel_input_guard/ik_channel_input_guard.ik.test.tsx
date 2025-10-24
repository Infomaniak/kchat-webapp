// IkChannelInputGuard.test.tsx
import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import * as GlobalActions from 'actions/global_actions';

import IkChannelInputGuard from './ik_channel_input_guard';

jest.mock('actions/global_actions', () => ({
    joinChannel: jest.fn(),
}));

jest.mock('components/banner_join_channel', () => ({
    BannerJoinChannel: jest.fn(({onButtonClick}) => (
        <button onClick={onButtonClick}>Join</button>
    )),
}));

describe('IkChannelInputGuard', () => {
    const baseChannel = {id: 'chan1', type: 'O'} as any;

    it('returns null if no channel', () => {
        const {container} = render(
            <IkChannelInputGuard
                isMember={false}
                channel={undefined}
            >
                <div>{'child'}</div>
            </IkChannelInputGuard>,
        );
        expect(container.firstChild).toBeNull();
    });

    it('hides content if private and not a member', () => {
        const channel = {id: 'chan1', type: 'P'} as any;
        const {container} = render(
            <IkChannelInputGuard
                isMember={false}
                channel={channel}
            >
                <div>{'child'}</div>
            </IkChannelInputGuard>,
        );
        expect(container.firstChild).toBeNull();
    });

    it('shows join banner if not member and public channel', () => {
        render(
            <IkChannelInputGuard
                isMember={false}
                channel={baseChannel}
            >
                <div>{'child'}</div>
            </IkChannelInputGuard>,
        );
        expect(screen.getByText('Join')).toBeInTheDocument();
    });

    it('calls GlobalActions.joinChannel when join clicked', () => {
        render(
            <IkChannelInputGuard
                isMember={false}
                channel={baseChannel}
            >
                <div>{'child'}</div>
            </IkChannelInputGuard>,
        );
        fireEvent.click(screen.getByText('Join'));
        expect(GlobalActions.joinChannel).toHaveBeenCalledWith('chan1');
    });

    it('renders children if member', () => {
        render(
            <IkChannelInputGuard
                isMember={true}
                channel={baseChannel}
            >
                <div>{'child'}</div>
            </IkChannelInputGuard>,
        );
        expect(screen.getByText('child')).toBeInTheDocument();
    });
});
