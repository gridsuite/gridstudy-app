import { useParameterState } from '../../dialogs/parameters/parameters';
import { PARAM_LANGUAGE } from '../../../utils/config-params';
import { useCallback, useEffect, useMemo, useState } from '@types/react';
import { getComputedLanguage } from '../../../utils/language';
import AutocompleteInput from './autocomplete-input';

const CountrySelectionInput = ({ name, label, formProps }) => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);

    // supposed cached by node.js
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

    const values = useMemo(
        () =>
            localizedCountriesModule
                ? Object.keys(localizedCountriesModule.object())
                : [],
        [localizedCountriesModule]
    );

    return (
        <AutocompleteInput
            name={name}
            options={values}
            label={label}
            formProps={formProps}
        />
    );
};

export default CountrySelectionInput;
