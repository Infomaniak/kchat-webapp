/* eslint-disable prefer-const */
import type {
    JitsiMeetExternalAPIConstructor,
    ExternalAPIEventCallbacks,
    JitsiMeetExternalAPI as _JitsiMeetExternalAPI,
    AudioMuteStatusChangedEvent,
    LogEvent,
    VideoMuteStatusChangedEvent,
    ExternalAPIOptions as _ExternalAPIOptions,
    Config as _Config,
    InterfaceConfig as _InterfaceConfig,
} from 'jitsi-meet';

interface Config extends _Config {

    // Jitsi's types are missing these fields
    prejoinConfig?: {
        enabled: boolean;
        hideDisplayName?: boolean;
        hideExtraJoinButtons?: string[];
    };
    toolbarButtons?: string[];
    conferenceInfo?: {
        alwaysVIsible?: string[];
        autoHide?: string[];
    };
    disableSelfViewSettings?: boolean;
}

interface InterfaceConfig extends _InterfaceConfig {

    // XXX: It is unclear whether this is a typo of TOOLBAR_BUTTONS or if its just really undocumented,
    // either way it is missing in types, yet we try and use it
    MAIN_TOOLBAR_BUTTONS?: string[];
}

interface ExternalAPIOptions extends _ExternalAPIOptions {
    configOverwrite?: Config;
    interfaceConfigOverwrite?: InterfaceConfig;

    // Jitsi's types are missing these fields
    lang?: string;
}

declare let JitsiMeetExternalAPI: JitsiMeetExternalAPIConstructor;

let inConference = false;

// Jitsi params
let jitsiDomain: string;
let conferenceId: string;
let displayName: string;
let avatarUrl: string;
let userId: string;
let jitsiAuth: string;
let roomId: string;
let roomName: string;
let startAudioOnly: boolean;
let startWithAudioMuted: boolean | undefined;
let startWithVideoMuted: boolean | undefined;
let isVideoChannel: boolean;
let supportsScreensharing: boolean;
let language: string;

let meetApi: _JitsiMeetExternalAPI | undefined;
let skipWelcomeScreen = false;

const query = new URLSearchParams(window.location.search.substring(1));

const qParam = (name: string, optional = false): string => {
    const vals = query.getAll(name);
    if (!optional && vals.length !== 1) {
        throw new Error(`Expected singular ${name} in query string`);
    }
    return vals[0];
};

async function joinConference(audioInput?: string | null, videoInput?: string | null): Promise<void> {
    // let jwt: string | undefined;
    // if (jitsiAuth === JITSI_OPENIDTOKEN_JWT_AUTH) {
    //     // See https://github.com/matrix-org/prosody-mod-auth-matrix-user-verification
    //     const openIdToken = await widgetApi?.requestOpenIDConnectToken();
    //     logger.log('Got OpenID Connect token');

    //     if (!openIdToken?.access_token) {
    //         // eslint-disable-line camelcase
    //         // We've failing to get a token, don't try to init conference
    //         logger.warn('Expected to have an OpenID credential, cannot initialize widget.');
    //         document.getElementById('widgetActionContainer')!.innerText = 'Failed to load Jitsi widget';
    //         return;
    //     }
    //     jwt = createJWTToken(openIdToken);
    // }

    switchVisibleContainers();

    const options: ExternalAPIOptions = {
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsiContainer') ?? undefined,
        roomName: conferenceId,
        devices: {
            audioInput,
            videoInput,
        },
        userInfo: {
            displayName,
            email: userId,
        },
        interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MAIN_TOOLBAR_BUTTONS: [],
            VIDEO_LAYOUT_FIT: 'height',
        },
        configOverwrite: {
            subject: roomName,
            startAudioOnly,
            startWithAudioMuted: audioInput === null ? true : startWithAudioMuted,
            startWithVideoMuted: videoInput === null ? true : startWithVideoMuted,
            apiLogLevels: ['warn', 'error'],
        } as any,

        // jwt,
        // lang: mapLanguage(normalizeLanguage(language)),
    };

    // Video channel widgets need some more tailored config options
    if (isVideoChannel) {
        // We don't skip jitsi's prejoin screen for video rooms.
        options.configOverwrite!.prejoinConfig = {enabled: true};

        // Use a simplified set of toolbar buttons
        options.configOverwrite!.toolbarButtons = ['microphone', 'camera', 'tileview', 'hangup'];

        // Note: We can hide the screenshare button in video rooms but not in
        // normal conference calls, since in video rooms we control exactly what
        // set of controls appear, but in normal calls we need to leave that up
        // to the deployment's configuration.
        // https://github.com/element-hq/element-web/issues/4880#issuecomment-940002464
        if (supportsScreensharing) {
            options.configOverwrite!.toolbarButtons.splice(2, 0, 'desktop');
        }

        // Hide all top bar elements
        options.configOverwrite!.conferenceInfo = {autoHide: []};

        // Remove the ability to hide your own tile, since we're hiding the
        // settings button which would be the only way to get it back
        options.configOverwrite!.disableSelfViewSettings = true;
    }

    meetApi = new JitsiMeetExternalAPI(jitsiDomain, options);

    // fires once when user joins the conference
    // (regardless of video on or off)
    meetApi.on('videoConferenceJoined', onVideoConferenceJoined);
    meetApi.on('videoConferenceLeft', onVideoConferenceLeft);
    meetApi.on('readyToClose', closeConference as ExternalAPIEventCallbacks['readyToClose']);

    // meetApi.on('errorOccurred', onErrorOccurred);
    // meetApi.on('audioMuteStatusChanged', onAudioMuteStatusChanged);
    // meetApi.on('videoMuteStatusChanged', onVideoMuteStatusChanged);

    // (['videoConferenceJoined', 'participantJoined', 'participantLeft'] as const).forEach((event) => {
    //     meetApi!.on(event, updateParticipants);
    // });

    meetApi.on('log', onLog);
}

const onVideoConferenceLeft = (): void => {
    // notifyHangup();
    meetApi = undefined;
};

function closeConference(): void {
    switchVisibleContainers();
    document.getElementById('jitsiContainer')!.innerHTML = '';
}

const onVideoConferenceJoined = (): void => {
    // Although we set our displayName with the userInfo option above, that
    // option has a bug where it causes the name to be the HTML encoding of
    // what was actually intended. So, we use the displayName command to at
    // least ensure that the name is correct after entering the meeting.
    // https://github.com/jitsi/jitsi-meet/issues/11664
    // We can't just use these commands immediately after creating the
    // iframe, because there's *another* bug where they can crash Jitsi by
    // racing with its startup process.
    if (displayName) {
        meetApi?.executeCommand('displayName', displayName);
    }

    // This doesn't have a userInfo equivalent, so has to be set via commands
    if (avatarUrl) {
        meetApi?.executeCommand('avatarUrl', avatarUrl);
    }
};

function switchVisibleContainers(): void {
    inConference = !inConference;
}

const onLog = ({logLevel, args}: LogEvent): void =>
    (parent as unknown as typeof global).console.log('[kmeet]', logLevel, ...args);
