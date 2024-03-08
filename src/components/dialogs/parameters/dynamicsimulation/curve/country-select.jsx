/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CheckboxSelect from './common/checkbox-select';
import { useLocalizedCountries } from '../../../../utils/localized-countries-hook.js';

const CountrySelect = ({ value, options, onChange }) => {
    const { translate } = useLocalizedCountries();

    return (
        <CheckboxSelect
            options={options}
            getOptionLabel={(code) => translate(code)}
            value={value}
            onChange={onChange}
        />
    );
};

export default CountrySelect;
