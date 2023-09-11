/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useParameterState } from 'components/dialogs/parameters/parameters';
import { useCallback, useMemo } from 'react';
import { PARAM_LANGUAGE } from 'utils/config-params';
import { getComputedLanguage } from 'utils/language';
import { Chip } from '@mui/material';
import { AutocompleteInput } from '@gridsuite/commons-ui';

export const CountriesInput = ({ name, label }) => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const countriesListCB = useCallback(() => {
        try {
            return require('localized-countries')(
                require('localized-countries/data/' +
                    getComputedLanguage(languageLocal).substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            return require('localized-countries')(
                require('localized-countries/data/en')
            );
        }
    }, [languageLocal]);

    const countriesList = useMemo(() => countriesListCB(), [countriesListCB]);

    const getLabel = (code) => {
        return countriesList.get(code);
    };

    return (
        <AutocompleteInput
            name={name}
            label={label}
            options={Object.keys(countriesList.object())}
            getOptionLabel={getLabel}
            fullWidth
            multiple
            renderTags={(val, getTagsProps) =>
                val.map((code, index) => (
                    <Chip
                        key={code}
                        size={'small'}
                        label={getLabel(code)}
                        {...getTagsProps({ index })}
                    />
                ))
            }
        />
    );
};

export default CountriesInput;
