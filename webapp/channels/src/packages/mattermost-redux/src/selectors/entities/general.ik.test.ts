// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General} from 'mattermost-redux/constants';

describe('Selectors.General', () => {
    describe('getAutolinkedUrlSchemes', () => {
        it('should include craftdocs in DEFAULT_AUTOLINKED_URL_SCHEMES', () => {
        // Non-regression test: ensure craftdocs scheme is not removed
            expect(General.DEFAULT_AUTOLINKED_URL_SCHEMES).toContain('craftdocs');
        });
    });
});

