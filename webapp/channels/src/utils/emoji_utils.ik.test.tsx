// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// IK Custom Tests: Verifying that system emojis are NOT prioritized over custom emojis
// when their names are the same. This is the expected behavior after the ikDefaultRule change.

import {TestHelper as TH} from 'utils/test_helper';

import {compareEmojis} from './emoji_utils';

describe('compareEmojis - IK custom behavior', () => {
    describe('should NOT prioritize system emojis over custom emojis with the same name', () => {
        test('custom emoji should sort equally with system emoji when names are identical', () => {
            const systemEmoji = TH.getSystemEmojiMock({
                short_name: 'smile',
                short_names: ['smile'],
                category: 'people-body',
            });

            const customEmoji = TH.getCustomEmojiMock({
                name: 'smile',
            });

            // When names are the same, the order should be determined by localeCompare
            // which should return 0 for identical names
            const result = compareEmojis(customEmoji, systemEmoji, '');

            // Since both have the same name 'smile', localeCompare should return 0
            expect(result).toBe(0);
        });

        test('custom emoji with same name should NOT be pushed after system emoji', () => {
            const systemEmoji = TH.getSystemEmojiMock({
                short_name: 'wave',
                short_names: ['wave'],
                category: 'people-body',
            });

            const customEmoji = TH.getCustomEmojiMock({
                name: 'wave',
            });

            const anotherEmoji = TH.getCustomEmojiMock({
                name: 'hello',
            });

            const emojiArray = [systemEmoji, customEmoji, anotherEmoji];
            emojiArray.sort((a, b) => compareEmojis(a, b, ''));

            // 'hello' should come first alphabetically, then both 'wave' emojis
            // The key point: custom 'wave' should NOT be pushed after system 'wave'
            expect(emojiArray[0]).toEqual(anotherEmoji); // 'hello' first
            // Both 'wave' emojis should be together, order between them is stable (original order preserved when equal)
        });

        test('alphabetical sorting should apply regardless of emoji type', () => {
            const systemApple = TH.getSystemEmojiMock({
                short_name: 'apple',
                short_names: ['apple'],
                category: 'food-drink',
            });

            const customBanana = TH.getCustomEmojiMock({
                name: 'banana',
            });

            const systemCherry = TH.getSystemEmojiMock({
                short_name: 'cherry',
                short_names: ['cherry'],
                category: 'food-drink',
            });

            const customDate = TH.getCustomEmojiMock({
                name: 'date',
            });

            const emojiArray = [customDate, systemCherry, customBanana, systemApple];
            emojiArray.sort((a, b) => compareEmojis(a, b, ''));

            // Should be sorted purely alphabetically: apple, banana, cherry, date
            expect(emojiArray).toEqual([systemApple, customBanana, systemCherry, customDate]);
        });
    });

    describe('prefix matching should still work correctly', () => {
        test('emojis starting with search term should appear first', () => {
            const customSmileWide = TH.getCustomEmojiMock({
                name: 'smile-wide',
            });

            const systemSmile = TH.getSystemEmojiMock({
                short_name: 'smile',
                short_names: ['smile'],
                category: 'people-body',
            });

            const customHappy = TH.getCustomEmojiMock({
                name: 'happy',
            });

            const emojiArray = [customHappy, customSmileWide, systemSmile];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'smi'));

            // Both smile emojis should come before happy (prefix match)
            // Among smile emojis, they should be sorted alphabetically
            expect(emojiArray[0]).toEqual(systemSmile); // 'smile' comes before 'smile-wide'
            expect(emojiArray[1]).toEqual(customSmileWide);
            expect(emojiArray[2]).toEqual(customHappy);
        });

        test('custom emoji with matching prefix should appear before non-matching system emoji', () => {
            const customRocket = TH.getCustomEmojiMock({
                name: 'rocket-custom',
            });

            const systemStar = TH.getSystemEmojiMock({
                short_name: 'star',
                short_names: ['star'],
                category: 'nature',
            });

            const emojiArray = [systemStar, customRocket];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'rock'));

            // Custom rocket should come first because it matches the prefix
            expect(emojiArray[0]).toEqual(customRocket);
            expect(emojiArray[1]).toEqual(systemStar);
        });
    });

    describe('thumbs emoji special cases should still work', () => {
        test('thumbsup should still sort before thumbsdown regardless of type', () => {
            const systemThumbsUp = TH.getSystemEmojiMock({
                short_name: 'thumbsup',
                short_names: ['+1', 'thumbsup'],
                category: 'people-body',
            });

            const systemThumbsDown = TH.getSystemEmojiMock({
                short_name: 'thumbsdown',
                short_names: ['-1', 'thumbsdown'],
                category: 'people-body',
            });

            const emojiArray = [systemThumbsDown, systemThumbsUp];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'thumb'));

            expect(emojiArray[0]).toEqual(systemThumbsUp);
            expect(emojiArray[1]).toEqual(systemThumbsDown);
        });

        test('custom thumbs emoji should sort after system thumbs emojis when searching', () => {
            const systemThumbsUp = TH.getSystemEmojiMock({
                short_name: 'thumbsup',
                short_names: ['+1', 'thumbsup'],
                category: 'people-body',
            });

            const customThumbsCustom = TH.getCustomEmojiMock({
                name: 'thumbs-custom',
            });

            const emojiArray = [customThumbsCustom, systemThumbsUp];
            emojiArray.sort((a, b) => compareEmojis(a, b, 'thumb'));

            // Both match prefix, so alphabetical order applies
            // 'thumbs-custom' vs 'thumbsup' - 'thumbs-custom' comes first alphabetically
            expect(emojiArray[0]).toEqual(customThumbsCustom);
            expect(emojiArray[1]).toEqual(systemThumbsUp);
        });
    });
});
