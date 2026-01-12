// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import type {ElementType} from 'react';
import React from 'react';
import type {DroppableProvided, DropResult} from 'react-beautiful-dnd';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import Scrollbars from 'react-custom-scrollbars';
import type {WrappedComponentProps} from 'react-intl';
import {injectIntl} from 'react-intl';
import type {RouteComponentProps} from 'react-router-dom';

import type {Team} from '@mattermost/types/teams';

import {setLastKSuiteSeenCookie} from 'mattermost-redux/utils/team_utils';

import TeamButton from 'components/team_sidebar/components/team_button';

import {Constants} from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';
import {filterAndSortTeamsByDisplayName} from 'utils/team_utils';
import * as Utils from 'utils/utils';

import Pluggable from 'plugins/pluggable';

import type {PropsFromRedux} from './index';

export type Props = PropsFromRedux & RouteComponentProps & WrappedComponentProps<'intl'>;

type State = {
    showOrder: boolean;
    teamsOrder: Team[];
}

export function renderView(props: Props) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />
    );
}

export function renderThumbHorizontal(props: Props) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />
    );
}

export function renderThumbVertical(props: Props) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />
    );
}

export class TeamSidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showOrder: false,
            teamsOrder: [],
        };
    }

    switchToPrevOrNextTeam = (e: KeyboardEvent, currentTeamId: string, teams: Team[]) => {
        if (isKeyPressed(e, Constants.KeyCodes.UP) || isKeyPressed(e, Constants.KeyCodes.DOWN)) {
            e.preventDefault();
            const delta = isKeyPressed(e, Constants.KeyCodes.DOWN) ? 1 : -1;
            const pos = teams.findIndex((team: Team) => team.id === currentTeamId);
            const newPos = pos + delta;

            let team;
            if (newPos === -1) {
                team = teams[teams.length - 1];
            } else if (newPos === teams.length) {
                team = teams[0];
            } else {
                team = teams[newPos];
            }

            window.location.href = team.url;
            return true;
        }
        return false;
    };

    switchToTeamByNumber = (e: KeyboardEvent, currentTeamId: string, teams: Team[]) => {
        const digits = [
            Constants.KeyCodes.ONE,
            Constants.KeyCodes.TWO,
            Constants.KeyCodes.THREE,
            Constants.KeyCodes.FOUR,
            Constants.KeyCodes.FIVE,
            Constants.KeyCodes.SIX,
            Constants.KeyCodes.SEVEN,
            Constants.KeyCodes.EIGHT,
            Constants.KeyCodes.NINE,
            Constants.KeyCodes.ZERO,
        ];

        for (const idx in digits) {
            if (isKeyPressed(e, digits[idx]) && parseInt(idx, 10) < teams.length) {
                e.preventDefault();

                // prevents reloading the current team, while still capturing the keyboard shortcut
                if (teams[idx].id === currentTeamId) {
                    return false;
                }
                const team = teams[idx];

                window.location.href = team.url;
                return true;
            }
        }
        return false;
    };

    handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.altKey) {
            const {currentTeamId} = this.props;
            const teams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale, this.props.userTeamsOrderPreference);

            if (this.switchToPrevOrNextTeam(e, currentTeamId, teams)) {
                return;
            }

            if (this.switchToTeamByNumber(e, currentTeamId, teams)) {
                return;
            }

            this.setState({showOrder: true});
        }
    };

    handleKeyUp = (e: KeyboardEvent) => {
        if (!((e.ctrlKey || e.metaKey) && e.altKey)) {
            this.setState({showOrder: false});
        }
    };

    componentDidUpdate(prevProps: Props) {
        // TODO: debounce
        if (prevProps.currentTeamId !== this.props.currentTeamId && this.props.enableWebSocketEventScope) {
            // WebSocketClient.updateActiveTeam(this.props.currentTeamId);
        }
    }

    componentDidMount() {
        // this.props.actions.getTeams(0, 200);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    onDragEnd = (result: DropResult) => {
        const {
            updateTeamsOrderForUser,
        } = this.props.actions;

        if (!result.destination) {
            return;
        }

        const teams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale, this.props.userTeamsOrderPreference);

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        // Positioning the dropped Team button
        const popElement = (list: Team[], idx: number) => {
            return [...list.slice(0, idx), ...list.slice(idx + 1, list.length)];
        };

        const pushElement = (list: Team[], idx: number, itemId: string): Team[] => {
            return [
                ...list.slice(0, idx),
                teams.find((team) => team.id === itemId)!,
                ...list.slice(idx, list.length),
            ];
        };

        const newTeamsOrder = pushElement(
            popElement(teams, sourceIndex),
            destinationIndex,
            result.draggableId,
        );
        updateTeamsOrderForUser(newTeamsOrder.map((o: Team) => o.id));
        this.setState({teamsOrder: newTeamsOrder});
    };

    switchTeamIK(teamName: string, teamId: string) {
        setLastKSuiteSeenCookie(teamId);
        window.postMessage(
            {
                type: 'switch-server',
                data: teamName,
            },
            window.origin,
        );
    }

    render() {
        const root: Element | null = document.querySelector('#root');
        if (this.props.myTeams.length <= 1) {
            root!.classList.remove('multi-teams');
            return null;
        }
        root!.classList.add('multi-teams');

        const plugins = [];
        const sortedTeams = filterAndSortTeamsByDisplayName(this.props.myTeams, this.props.locale, this.props.userTeamsOrderPreference);

        const {currentProduct} = this.props;
        if (currentProduct && !currentProduct.showTeamSidebar) {
            return null;
        }

        const teams = sortedTeams.map((team: Team, index: number) => {
            return (
                <TeamButton
                    key={'switch_team_' + team.name}
                    url={team.url}
                    tip={team.display_name}
                    active={team.id === this.props.currentTeamId}
                    displayName={team.display_name}
                    order={index + 1}
                    showOrder={this.state.showOrder}
                    unread={this.props.unreadTeamsSet.has(team.id)}
                    mentions={this.props.mentionsInTeamMap.has(team.id) ? this.props.mentionsInTeamMap.get(team.id) : 0}
                    hasUrgent={this.props.teamHasUrgentMap.has(team.id) ? this.props.teamHasUrgentMap.get(team.id) : false}
                    teamIconUrl={Utils.imageURLForTeam(team)}

                    // @ts-expect-error for safety i silented it
                    switchTeam={this.switchTeamIK}
                    isDraggable={true}
                    teamId={team.id}
                    teamIndex={index}
                    isInProduct={Boolean(currentProduct)}
                />
            );
        });

        const joinableTeams = [] as ElementType[];

        // Disable team sidebar pluggables in products until proper support can be provided.
        const isNonChannelsProduct = !currentProduct;
        if (isNonChannelsProduct) {
            plugins.push(
                <div
                    key='team-sidebar-bottom-plugin'
                    className='team-sidebar-bottom-plugin is-empty'
                >
                    <Pluggable pluggableName='BottomTeamSidebar'/>
                </div>,
            );
        }

        return (
            <div
                className={classNames('team-sidebar', {'move--right': this.props.isOpen})}
                role='navigation'
                aria-labelledby='teamSidebarWrapper'
            >
                <div
                    className='team-wrapper'
                    id='teamSidebarWrapper'
                >
                    <Scrollbars
                        autoHide={true}
                        autoHideTimeout={500}
                        autoHideDuration={500}
                        renderThumbHorizontal={renderThumbHorizontal}
                        renderThumbVertical={renderThumbVertical}
                        renderView={renderView}
                    >
                        <DragDropContext
                            onDragEnd={this.onDragEnd}
                        >
                            <Droppable
                                droppableId='my_teams'
                                type='TEAM_BUTTON'
                            >
                                {(provided: DroppableProvided) => {
                                    return (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {teams}
                                            {provided.placeholder}
                                        </div>
                                    );
                                }}
                            </Droppable>
                        </DragDropContext>
                        {joinableTeams}
                    </Scrollbars>
                </div>
                {plugins}
            </div>
        );
    }
}

export default injectIntl(TeamSidebar);
