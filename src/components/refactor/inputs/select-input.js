/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import AutocompleteInput from './autocomplete-input';

const SelectInput = (props) => {
    return <AutocompleteInput readOnly={true} {...props} />;
};

SelectInput.propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.any,
    isRequired: PropTypes.bool,
    options: PropTypes.array.isRequired,
    errorMsg: PropTypes.string,
    previousValue: PropTypes.object,
};

export default SelectInput;
