/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Autocomplete, TextField } from '@mui/material';
import React from 'react';
import { FieldLabel, genHelperError } from '../../dialogs/inputs/hooks-helpers';
import PropTypes from 'prop-types';

/**
 * Autocomplete input
 * @param label field label id, will be translated
 * @param required required state to append '(optional)' to the end of the label
 * @param options select options, each option needs a label that will be translated and an id
 * @param errorMessage errorMessage that will be displayed if not empty
 * @param onChange callback that need to be called on input value change
 * @param value input value
 * @returns autocomplete field containing the options values
 */
const AutocompleteInput = ({
    label,
    onChange,
    value,
    isRequired = false,
    options,
    errorMsg,
    ...props
}) => {
    return (
        <Autocomplete
            value={value}
            onChange={(event, data) => onChange(data)}
            options={options}
            renderInput={(params) => (
                <TextField
                    label={FieldLabel({
                        label: label,
                        optional: !isRequired,
                    })}
                    {...genHelperError(errorMsg)}
                    {...params}
                />
            )}
            {...props}
        />
    );
};

AutocompleteInput.propTypes = {
    label: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    options: PropTypes.array.isRequired,
    errorMessage: PropTypes.string,
    value: PropTypes.object,
    onChange: PropTypes.func,
};

export default AutocompleteInput;
