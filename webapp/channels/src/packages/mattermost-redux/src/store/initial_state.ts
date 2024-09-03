// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@mattermost/types/store';

import {zeroStateLimitedViews} from '../reducers/entities/posts';

const state: GlobalState = {
    entities: {
        general: {
            config: {},
            license: {},
            serverVersion: '',
            firstAdminVisitMarketplaceStatus: false,
            firstAdminCompleteSetup: false,
        },
        users: {
            currentUserId: '',
            isManualStatus: {},
            mySessions: [],
            myAudits: [],
            profiles: {},
            profilesInTeam: {},
            profilesNotInTeam: {},
            profilesWithoutTeam: new Set(),
            profilesInChannel: {},
            profilesNotInChannel: {},
            profilesInGroup: {},
            profilesNotInGroup: {},
            statuses: {},
            stats: {},
            filteredStats: {},
            myUserAccessTokens: {},
            lastActivity: {},
            dndEndTimes: {},
        },
        limits: {
            serverLimits: {
                activeUserCount: 0,
                maxUsersLimit: 0,
            },
        },
        teams: {
            currentTeamId: '',
            teams: {},
            myMembers: {},
            membersInTeam: {},
            stats: {},
            groupsAssociatedToTeam: {},
            totalCount: 0,
        },
        channels: {
            currentChannelId: '',
            channels: {},
            channelsInTeam: {},
            myMembers: {},
            membersInChannel: {},
            stats: {},
            roles: {},
            groupsAssociatedToChannel: {},
            totalCount: 0,
            manuallyUnread: {},
            channelModerations: {},
            channelMemberCountsByGroup: {},
            messageCounts: {},
            channelsMemberCount: {},
            pendingGuests: {},
        },
        channelBookmarks: {
            byChannelId: {},
        },
        posts: {
            expandedURLs: {},
            posts: {},
            postsReplies: {},
            postsInChannel: {},
            postsInThread: {},
            pendingPostIds: [],
            postEditHistory: [],
            reactions: {},
            openGraph: {},
            currentFocusedPostId: '',
            messagesHistory: {
                messages: [],
                index: {
                    post: -1,
                    comment: -1,
                },
            },
            limitedViews: zeroStateLimitedViews,
            acknowledgements: {},
        },
        threads: {
            threadsInTeam: {},
            unreadThreadsInTeam: {},
            threads: {},
            counts: {},
            countsIncludingDirect: {},
        },
        preferences: {
            myPreferences: {},
            userPreferences: {},
        },
        bots: {
            accounts: {},
        },
        admin: {
            logs: [],
            audits: {},
            config: {},
            environmentConfig: {},
            complianceReports: {},
            ldapGroups: {},
            ldapGroupsCount: 0,
            userAccessTokens: {},
            clusterInfo: [],
            analytics: {},
            teamAnalytics: {},
            dataRetentionCustomPolicies: {},
            dataRetentionCustomPoliciesCount: 0,
            prevTrialLicense: {},
        },
        jobs: {
            jobs: {},
            jobsByTypeList: {},
        },
        integrations: {
            incomingHooks: {},
            outgoingHooks: {},
            oauthApps: {},
            systemCommands: {},
            commands: {},
            appsBotIDs: [],
            appsOAuthAppIDs: [],
            outgoingOAuthConnections: {},
        },
        files: {
            files: {},
            filesFromSearch: {},
            fileIdsByPostId: {},
        },
        emojis: {
            customEmoji: {},
            nonExistentEmoji: new Set(),
        },
        search: {
            results: [],
            fileResults: [],
            current: {},
            matches: {},
            flagged: [],
            pinned: {},
            isSearchingTerm: false,
            isSearchGettingMore: false,
            hasLimitation: -1,

            // mattermost limitations
            // isLimitedResults: -1,
        },
        typing: {},
        roles: {
            roles: {},
            pending: new Set(),
        },
        gifs: {
            app: {
                appClassName: '',
                appId: '',
                appName: '',
                basePath: '',
                enableHistory: false,
                header: {
                    tabs: [],
                    displayText: false,
                },
                itemTapType: 0,
                shareEvent: '',
            },
            categories: {
                tagsList: [],
                tagsDict: {},
                cursor: '',
                hasMore: false,
                isFetching: false,
            },
            cache: {
                gifs: {},
                updating: false,
            },
            search: {
                searchText: '',
                searchBarText: '',
                resultsByTerm: {},
                scrollPosition: 0,
                priorLocation: null,
            },
        },
        schemes: {
            schemes: {},
        },
        groups: {
            groups: {},
            syncables: {},
            myGroups: [],
            stats: {},
        },
        channelCategories: {
            byId: {},
            orderByTeam: {},
        },
        apps: {
            main: {
                bindings: [],
                forms: {},
            },
            rhs: {
                bindings: [],
                forms: {},
            },
            pluginEnabled: true,
        },
        cloud: {
            limits: {
                limits: {
                    public_channels: 0,
                    private_channels: 0,
                    members: 0,
                    guests: 0,
                    storage: 0,
                },
                limitsLoaded: false,
            },
            errors: {},
        },
        hostedCustomer: {
            products: {
                products: {},
                productsLoaded: false,
            },
        },
        usage: {
            storage: 0,
            public_channels: 0,
            private_channels: 0,
            guests: 0,
            pending_guests: 0,
            members: 0,
            usageLoaded: false,
            files: {
                totalStorage: 0,
                totalStorageLoaded: true,
            },
            messages: {
                history: 0,
                historyLoaded: true,
            },
            teams: {
                active: 0,
                cloudArchived: 0,
                teamsLoaded: true,
            },
        },
        insights: {
            topReactions: {},
            myTopReactions: {},
        },
    },
    errors: [],
    requests: {
        channels: {
            getAllChannels: {
                status: 'not_started',
                error: null,
            },
            getChannels: {
                status: 'not_started',
                error: null,
            },
            myChannels: {
                status: 'not_started',
                error: null,
            },
            createChannel: {
                status: 'not_started',
                error: null,
            },
        },
        general: {
            websocket: {
                status: 'not_started',
                error: null,
            },
        },
        posts: {
            createPost: {
                status: 'not_started',
                error: null,
            },
            editPost: {
                status: 'not_started',
                error: null,
            },
            getPostThread: {
                status: 'not_started',
                error: null,
            },
        },
        teams: {
            getMyTeams: {
                status: 'not_started',
                error: null,
            },
            getMyKSuites: {
                status: 'not_started',
                error: null,
            },
            getTeams: {
                status: 'not_started',
                error: null,
            },
        },
        users: {
            login: {
                status: 'not_started',
                error: null,
            },
            logout: {
                status: 'not_started',
                error: null,
            },
            autocompleteUsers: {
                status: 'not_started',
                error: null,
            },
            updateMe: {
                status: 'not_started',
                error: null,
            },
        },
        admin: {
            createCompliance: {
                status: 'not_started',
                error: null,
            },
        },
        files: {
            uploadFiles: {
                status: 'not_started',
                error: null,
            },
        },
        roles: {
            getRolesByNames: {
                status: 'not_started',
                error: null,
            },
            getRoleByName: {
                status: 'not_started',
                error: null,
            },
            getRole: {
                status: 'not_started',
                error: null,
            },
            editRole: {
                status: 'not_started',
                error: null,
            },
        },
    },
    websocket: {
        connected: false,
        lastConnectAt: 0,
        lastDisconnectAt: 0,
        connectionId: '',
    },
};
export default state;
