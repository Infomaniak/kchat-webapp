// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel, ServerChannel} from '@mattermost/types/channels';
import type {MarketplaceApp, MarketplacePlugin} from '@mattermost/types/marketplace';
import type {Call} from '@mattermost/types/posts';
import type {CursorPaginationDirection, ReportDuration} from '@mattermost/types/reports';
import type {Team} from '@mattermost/types/teams';
import type {UserThread} from '@mattermost/types/threads';
import type {UserProfile} from '@mattermost/types/users';
import type {RelationOneToOne} from '@mattermost/types/utilities';

import type {Theme} from 'mattermost-redux/selectors/entities/preferences';

import type {Conference} from 'types/conference';
import type {DesktopThemePreference} from 'types/theme';

import type {I18nState} from './i18n';
import type {LhsViewState} from './lhs';
import type {RhsViewState} from './rhs';
import type {Server} from './servers';

import type {DraggingState} from '.';

export type ModalFilters = {
    roles?: string[];
    channel_roles?: string[];
    team_roles?: string[];
};

export type AdminConsoleUserManagementTableProperties = {
    sortColumn: string;
    sortIsDescending: boolean;
    pageSize: number;
    pageIndex: number;
    cursorUserId: string;
    cursorColumnValue: string;
    cursorDirection: CursorPaginationDirection;
    columnVisibility: Record<string, boolean>;
    searchTerm: string;
    filterTeam: string;
    filterTeamLabel: string;
    filterStatus: string;
    filterRole: string;
    dateRange?: ReportDuration;
};

export type ViewsState = {
    admin: {
        navigationBlock: {
            blocked: boolean;
            onNavigationConfirmed: () => void;
            showNavigationPrompt: boolean;
        };
        needsLoggedInLimitReachedCheck: boolean;
        adminConsoleUserManagementTableProperties: AdminConsoleUserManagementTableProperties;
    };

    announcementBar: {
        announcementBarState: {
            announcementBarCount: number;
        };
    };

    browser: {
        focused: boolean;
        windowSize: string;
    };

    channel: {
        postVisibility: {
            [channelId: string]: number;
        };
        lastChannelViewTime: {
            [channelId: string]: number;
        };
        loadingPost: {
            [channelId: string]: boolean;
        };
        focusedPostId: string;
        mobileView: boolean;
        lastUnreadChannel: (Channel & {hadMentions: boolean}) | null; // Actually only an object with {id: string, hadMentions: boolean}
        lastGetPosts: {
            [channelId: string]: number;
        };
        channelPrefetchStatus: {
            [channelId: string]: string;
        };
        toastStatus: boolean;
    };

    calls: {
        voiceConnectedProfiles: {
            [channelId: string]: UserProfile[];
        };
        voiceUsersStatuses: {
            // eslint-disable-next-line @typescript-eslint/ban-types
            [channelId: string]: Object;
        };
        callStartAt: {
            [channelId: string]: number;
        };
        expandedView: boolean;
        switchCallModal: boolean;
        connectedChannelID: string;
        connectedCallID: string;
        connectedCallUrl: string;
        voiceConnectedChannels: any;
        callParameters: {users: UserProfile[]; caller: UserProfile; channel: ServerChannel; msg: Call};
    };

    kmeetCalls: {
        conferences: {
            [channelId: string]: Conference;
        };
    };

    drafts: {
        remotes: {
            [storageKey: string]: boolean;
        };
    };

    rhs: RhsViewState;

    rhsSuppressed: boolean;

    posts: {
        editingPost: {
            postId: string;
            show: boolean;
            isRHS: boolean;
        };
        menuActions: {
            [postId: string]: {
                [actionId: string]: {
                    text: string;
                    value: string;
                };
            };
        };
    };

    modals: {
        modalState: {
            [modalId: string]: {
                open: boolean;
                dialogProps: Record<string, any>;
                dialogType: React.ComponentType;
            };
        };
        showLaunchingWorkspace: boolean;
    };

    emoji: {
        emojiPickerCustomPage: number;
        shortcutReactToLastPostEmittedFrom: string;
    };

    i18n: I18nState;

    lhs: LhsViewState;

    search: {
        modalSearch: string;
        popoverSearch: string;
        channelMembersRhsSearch: string;
        modalFilters: ModalFilters;
        userGridSearch: {
            term: string;
            filters: {
                roles?: string[];
                channel_roles?: string[];
                team_roles?: string[];
            };
        };
        teamListSearch: string;
        channelListSearch: {
            term: string;
            filters: {
                public?: boolean;
                private?: boolean;
                deleted?: boolean;
                team_ids?: string[];
            };
        };
    };

    notice: {
        hasBeenDismissed: {
            [message: string]: boolean;
        };
    };

    system: {
        websocketConnectionErrorCount: number;
    };

    channelSelectorModal: {
        channels: string[];
    };

    settings: {
        activeSection: string;
        previousActiveSection: string;
    };

    marketplace: {
        plugins: MarketplacePlugin[];
        apps: MarketplaceApp[];
        installing: {[id: string]: boolean};
        errors: {[id: string]: string};
        filter: string;
    };

    productMenu: {
        switcherOpen: boolean;
    };

    channelSidebar: {
        unreadFilterEnabled: boolean;
        draggingState: DraggingState;
        newCategoryIds: string[];
        multiSelectedChannelIds: string[];
        lastSelectedChannel: string;
    };

    statusDropdown: {
        isOpen: boolean;
    };

    addChannelDropdown: {
        isOpen: boolean;
    };

    addChannelCtaDropdown: {
        isOpen: boolean;
    };

    onboardingTasks: {
        isShowOnboardingTaskCompletion: boolean;
        isShowOnboardingCompleteProfileTour: boolean;
        isShowOnboardingVisitConsoleTour: boolean;
    };

    threads: {
        selectedThreadIdInTeam: RelationOneToOne<Team, UserThread['id'] | null>;
        lastViewedAt: {[id: string]: number};
        manuallyUnread: {[id: string]: boolean};
        toastStatus: boolean;
    };

    textbox: {
        shouldShowPreviewOnCreateComment: boolean;
        shouldShowPreviewOnCreatePost: boolean;
        shouldShowPreviewOnEditChannelHeaderModal: boolean;
        shouldShowPreviewOnEditPostModal: boolean;
    };
    theme: {
        storedTheme: Theme | null;
        themePreference: DesktopThemePreference;
    };
    servers: {
        servers: Record<string, Server>;
    };
};
