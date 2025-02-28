/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PARAM_LANGUAGE } from '../../utils/config-params';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getComputedLanguage } from '../../utils/language';
import localizedCountries from 'localized-countries';
import countriesFr from 'localized-countries/data/fr.json';
import countriesEn from 'localized-countries/data/en.json';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

export const useLocalizedCountries = () => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const [localizedCountriesModule, setLocalizedCountriesModule] = useState<localizedCountries.LocalizedCountries>();

    //TODO FM this is disgusting, can we make it better ?
    useEffect(() => {
        const lang = getComputedLanguage(languageLocal).substr(0, 2);
        let localizedCountriesResult: localizedCountries.LocalizedCountries;
        // vite does not support ESM dynamic imports on node_modules, so we have to imports the languages before and do this
        // https://github.com/vitejs/vite/issues/14102
        if (lang === 'fr') {
            localizedCountriesResult = localizedCountries(countriesFr);
        } else if (lang === 'en') {
            localizedCountriesResult = localizedCountries(countriesEn);
        } else {
            console.warn('Unsupported language "' + lang + '" for countries translation, we use english as default');
            localizedCountriesResult = localizedCountries(countriesEn);
        }
        setLocalizedCountriesModule(localizedCountriesResult);
    }, [languageLocal]);

    const countryCodes = useMemo(
        () => (localizedCountriesModule ? Object.keys(localizedCountriesModule.object()) : []),
        [localizedCountriesModule]
    );

    const translate = useCallback(
        (countryCode: string) => (localizedCountriesModule ? localizedCountriesModule.get(countryCode) : ''),
        [localizedCountriesModule]
    );

    return { translate, countryCodes };
};
