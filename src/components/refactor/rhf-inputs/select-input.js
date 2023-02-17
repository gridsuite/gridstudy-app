/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import AutocompleteInput from './autocomplete-input';
import { useIntl } from 'react-intl';

const SelectInput = ({ options, ...props }) => {
    const intl = useIntl();

    const inputTransform = (value) =>
        options.find((option) => option?.id === value) || null;

    const outputTransform = (value) => {
        return value?.id ?? null;
    };

    return (
        <AutocompleteInput
            options={options}
            getOptionLabel={(option) => {
                return intl.formatMessage({ id: option?.id });
            }}
            inputTransform={inputTransform}
            outputTransform={outputTransform}
            readOnly={true}
            {...props}
        />
    );
};

SelectInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    previousValue: PropTypes.object,
};

export default SelectInput;
