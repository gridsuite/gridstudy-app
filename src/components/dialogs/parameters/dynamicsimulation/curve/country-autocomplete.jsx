/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLocalizedCountries } from '../../../../utils/localized-countries-hook.js';
import CheckboxAutocomplete from './common/checkbox-autocomplete.tsx';

const CountryAutocomplete = ({ id, options, onChange }) => {
    const { translate } = useLocalizedCountries();

    return (
        <CheckboxAutocomplete
            id={id}
            options={options}
            getOptionLabel={(code) => translate(code)}
            onChangeCallback={onChange}
        />
    );
};

export default CountryAutocomplete;
