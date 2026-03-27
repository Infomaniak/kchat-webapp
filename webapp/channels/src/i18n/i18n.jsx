// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * @typedef {} Language
 */

/* eslint-disable import/order */
/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import da from './da.json';
import de from './de.json';
import el from './el.json';
import en from './en.json';
import es from './es.json';
import fi from './fi.json';
import fr from './fr.json';
import it from './it.json';
import nl from './nl.json';
import no from './no.json';
import pl from './pl.json';
import ptBR from './pt-BR.json';
import sv from './sv.json';
/* eslint-enable @typescript-eslint/no-unused-vars */
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {langFiles, langIDs, langLabels} from './imports';

export const languages = {
    en: {
        value: 'en',
        name: 'English',
        order: 0,
        url: '',
    },
    fr: {
        value: 'fr',
        name: 'Français',
        order: 1,
        url: langFiles.fr,
    },
    it: {
        value: 'it',
        name: 'Italiano',
        order: 2,
        url: langFiles.it,
    },
    es: {
        value: 'es',
        name: 'Español',
        order: 3,
        url: langFiles.es,
    },
    de: {
        value: 'de',
        name: 'Deutsch',
        order: 4,
        url: langFiles.de,
    },
    'pt-BR': {
        value: 'pt-BR',
        name: 'Português (Brasil)',
        order: 5,
        url: langFiles['pt-BR'],
    },
    sv: {
        value: 'sv',
        name: 'Svenska',
        order: 6,
        url: langFiles.sv,
    },
    pl: {
        value: 'pl',
        name: 'Polski',
        order: 7,
        url: langFiles.pl,
    },
    nl: {
        value: 'nl',
        name: 'Nederlands',
        order: 8,
        url: langFiles.nl,
    },
    el: {
        value: 'el',
        name: 'Ελληνικά',
        order: 9,
        url: langFiles.el,
    },
    no: {
        value: 'no',
        name: 'Norsk',
        order: 10,
        url: langFiles.no,
    },
    da: {
        value: 'da',
        name: 'Dansk',
        order: 11,
        url: langFiles.da,
    },
    fi: {
        value: 'fi',
        name: 'Suomi',
        order: 12,
        url: langFiles.fi,
    },
};

export function getAllLanguages(includeExperimental) {
    if (includeExperimental) {
        let order = Object.keys(languages).length;
        return {
            ...langIDs.reduce((out, id) => {
                out[id] = {
                    value: id,
                    name: langLabels[id] + ' (Experimental)',
                    url: langFiles[id],
                    order: order++,
                };
                return out;
            }, {}),
            ...languages,
        };
    }
    return languages;
}

/**
 * @param {import('types/store').GlobalState} state
 * @returns {Record<string, Language>}
 */
export function getLanguages(state) {
    const config = getConfig(state);
    if (!config.AvailableLocales) {
        return getAllLanguages(config.EnableExperimentalLocales === 'true');
    }
    return config.AvailableLocales.split(',').reduce((result, l) => {
        if (languages[l]) {
            result[l] = languages[l];
        }
        return result;
    }, {});
}

export function getLanguageInfo(locale) {
    return getAllLanguages(true)[locale];
}

/**
 * @param {import('types/store').GlobalState} state
 * @param {string} locale
 * @returns {boolean}
 */
export function isLanguageAvailable(state, locale) {
    return Boolean(getLanguages(state)[locale]);
}
