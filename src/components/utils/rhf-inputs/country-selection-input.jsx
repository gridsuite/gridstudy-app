/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AutocompleteInput,
    useLocalizedCountries,
} from '@gridsuite/commons-ui';

const CountrySelectionInput = ({ name, label, formProps, ...props }) => {
    const { translate, countryCodes } = useLocalizedCountries();

    return (
        <AutocompleteInput
            name={name}
            options={countryCodes}
            label={label}
            formProps={formProps}
            getOptionLabel={(countryCode) => translate(countryCode)}
            {...props}
        />
    );
};

export default CountrySelectionInput;
