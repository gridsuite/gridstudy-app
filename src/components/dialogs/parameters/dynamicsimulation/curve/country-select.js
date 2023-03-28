/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import CheckmarkSelect from './checkmark-select';

const CountrySelect = ({ value }) => {
    // take from CountrySelector
    const countriesList = useMemo(() => {
        let countriesList;
        try {
            countriesList = require('localized-countries')(
                require('localized-countries/data/' +
                    navigator.language.substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            countriesList = require('localized-countries')(
                require('localized-countries/data/en')
            );
        }
        return countriesList;
    }, []);

    console.log('country list', countriesList);

    return (
        <CheckmarkSelect
            options={Object.keys(countriesList.object())}
            getOptionLabel={(code) => countriesList.get(code)}
            value={value}
        />
    );
};

export default CountrySelect;
