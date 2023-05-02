/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useParameterState } from '../dialogs/parameters/parameters';
import { PARAM_LANGUAGE } from '../../utils/config-params';
import { useMemo } from 'react';
import { getComputedLanguage } from '../../utils/language';

export const LocalizedCountries = () => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const englishCountriesModule = require('localized-countries')(
        require('localized-countries/data/en')
    );

    const localizedCountriesModule = useMemo(() => {
        try {
            return require('localized-countries')(
                require('localized-countries/data/' +
                    getComputedLanguage(languageLocal).substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            return englishCountriesModule;
        }
    }, [languageLocal, englishCountriesModule]);

    const countryCodes = useMemo(
        () =>
            localizedCountriesModule
                ? Object.keys(localizedCountriesModule.object())
                : [],
        [localizedCountriesModule]
    );

    const translate = (countryCode) => {
        return localizedCountriesModule.get(countryCode);
    };

    return { translate, countryCodes };
};
