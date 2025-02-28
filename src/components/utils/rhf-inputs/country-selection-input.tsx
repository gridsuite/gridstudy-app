/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AutocompleteInput, AutocompleteInputProps } from '@gridsuite/commons-ui';
import { useLocalizedCountries } from '../localized-countries-hook';

interface CountrySelectionInputProps extends Omit<AutocompleteInputProps, 'options' | 'getOptionLabel'> {}

const CountrySelectionInput = (props: CountrySelectionInputProps) => {
    const { translate, countryCodes } = useLocalizedCountries();

    return (
        <AutocompleteInput
            options={countryCodes}
            // TODO: the way Option is managed in AutocompleteInput is confusing, maybe make AutocompleteInput more generic in the future
            getOptionLabel={(countryCode) => translate(countryCode as string)}
            {...props}
        />
    );
};

export default CountrySelectionInput;
