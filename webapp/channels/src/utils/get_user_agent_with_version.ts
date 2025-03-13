// IK: Get kChat version and create a custom user-agent
export default function getUserAgentWithVersion() {
    const app = GIT_RELEASE && `kChat/${GIT_RELEASE.trim()}`;
    const build = COMMIT_HASH && `build/${GIT_RELEASE.trim()}`;

    return [window?.navigator?.userAgent, app, build].filter(Boolean).join(' ');
}
