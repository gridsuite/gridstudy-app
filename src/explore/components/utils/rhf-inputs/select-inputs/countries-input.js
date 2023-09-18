import { useParameterState } from '../../../dialogs/parameters-dialog';
import { PARAM_LANGUAGE } from '../../../../utils/config-params';
import React, { useCallback, useMemo } from 'react';
import { getComputedLanguage } from '../../../../utils/language';
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
