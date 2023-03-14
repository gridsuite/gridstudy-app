import { useParameterState } from '../../dialogs/parameters/parameters';
import { PARAM_LANGUAGE } from '../../../utils/config-params';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getComputedLanguage } from '../../../utils/language';
import AutocompleteInput from './autocomplete-input';

const CountrySelectionInput = ({ name, label, formProps, ...props }) => {
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

    useEffect(() => {
        console.log('values : ', values);
        console.log('localizedCountriesModule : ', localizedCountriesModule);
    }, [values, localizedCountriesModule]);

    useEffect(() => {
        console.log('values local : ', localizedCountriesModule.get('AF'));
    }, []);
    const countries = useMemo(
        () => values.map((value) => localizedCountriesModule.get(value)),
        [values, localizedCountriesModule]
    );

    return (
        <AutocompleteInput
            name={name}
            options={values}
            label={label}
            formProps={formProps}
            getOptionLabel={(value) => localizedCountriesModule.get(value)}
            {...props}
        />
    );
};

export default CountrySelectionInput;
