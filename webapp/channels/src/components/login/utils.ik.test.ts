import * as userAgent from 'utils/user_agent';

import {getChallengeAndRedirectToLogin} from './utils';

const MOCK_LOGIN_URL = 'https://login.infomaniak.com/';
const MOCK_CLIENT_ID = 'A7376A6D-9A79-4B06-A837-7D92DB93965B';

jest.mock('utils/constants-ik', () => ({
    IKConstants: {
        LOGIN_URL: 'https://login.infomaniak.com/',
        CLIENT_ID: 'A7376A6D-9A79-4B06-A837-7D92DB93965B',
    },
}));

jest.mock('utils/user_agent', () => ({
    ...jest.requireActual('utils/user_agent'),
    getDesktopVersion: jest.fn(),
}));

describe('getChallengeAndRedirectToLogin', () => {
    const mockLocationAssign = jest.fn();
    const originalLocation = window.location;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        // Mock window.location
        delete (window as any).location;
        (window as any).location = {
            ...originalLocation,
            origin: 'https://test.kchat.infomaniak.com',
            assign: mockLocationAssign,
        };
    });

    afterEach(() => {
        (window as any).location = originalLocation;
    });

    it('should redirect with access_type=offline for desktop version < 2.1.0', async () => {
        (userAgent.getDesktopVersion as jest.Mock).mockReturnValue('2.0.0');

        await getChallengeAndRedirectToLogin();

        expect(mockLocationAssign).toHaveBeenCalledTimes(1);

        const calledUrl = new URL(mockLocationAssign.mock.calls[0][0]);

        // Verify base URL
        expect(calledUrl.origin + calledUrl.pathname).toBe(`${MOCK_LOGIN_URL}authorize`);

        // Verify all required params are present
        expect(calledUrl.searchParams.get('code_challenge_method')).toBe('S256');
        expect(calledUrl.searchParams.get('code_challenge')).toBeTruthy();
        expect(calledUrl.searchParams.get('access_type')).toBe('offline');
        expect(calledUrl.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID);
        expect(calledUrl.searchParams.get('response_type')).toBe('code');
        expect(calledUrl.searchParams.get('redirect_uri')).toBe('https://test.kchat.infomaniak.com/');
    });

    it('should redirect without access_type for desktop version >= 2.1.0 (infinite token)', async () => {
        (userAgent.getDesktopVersion as jest.Mock).mockReturnValue('2.1.0');

        await getChallengeAndRedirectToLogin();

        expect(mockLocationAssign).toHaveBeenCalledTimes(1);

        const calledUrl = new URL(mockLocationAssign.mock.calls[0][0]);

        // Verify base URL
        expect(calledUrl.origin + calledUrl.pathname).toBe(`${MOCK_LOGIN_URL}authorize`);

        // Verify access_type is NOT present (infinite token)
        expect(calledUrl.searchParams.get('access_type')).toBeNull();

        // Verify other required params are still present
        expect(calledUrl.searchParams.get('code_challenge_method')).toBe('S256');
        expect(calledUrl.searchParams.get('code_challenge')).toBeTruthy();
        expect(calledUrl.searchParams.get('client_id')).toBe(MOCK_CLIENT_ID);
        expect(calledUrl.searchParams.get('response_type')).toBe('code');
        expect(calledUrl.searchParams.get('redirect_uri')).toBe('https://test.kchat.infomaniak.com/');
    });

    it('should redirect without access_type for desktop version > 2.1.0', async () => {
        (userAgent.getDesktopVersion as jest.Mock).mockReturnValue('2.5.0');

        await getChallengeAndRedirectToLogin();

        expect(mockLocationAssign).toHaveBeenCalledTimes(1);

        const calledUrl = new URL(mockLocationAssign.mock.calls[0][0]);

        // Verify access_type is NOT present (infinite token)
        expect(calledUrl.searchParams.get('access_type')).toBeNull();
    });

    it('should redirect with access_type=offline when not on desktop (empty version)', async () => {
        (userAgent.getDesktopVersion as jest.Mock).mockReturnValue('');

        await getChallengeAndRedirectToLogin();

        expect(mockLocationAssign).toHaveBeenCalledTimes(1);

        const calledUrl = new URL(mockLocationAssign.mock.calls[0][0]);

        // Web app should use refresh tokens (access_type=offline)
        expect(calledUrl.searchParams.get('access_type')).toBe('offline');
    });
});
