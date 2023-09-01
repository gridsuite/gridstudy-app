/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AutocompleteInput } from '@gridsuite/commons-ui';
import { forwardRef } from 'react';

const CellEditor = forwardRef(({ ...props }, ref) => {
    const { name, options, colDef, node } = props;
    const cellName = `${name}.${node.rowIndex}.${colDef.field}`;

    return (
        <AutocompleteInput
            allowNewValue
            name={cellName}
            options={options}
            getOptionLabel={(option) => option?.id ?? option}
            inputTransform={(val) => val.id ?? val}
            outputTransform={(val) => val.id ?? val}
            size={'small'}
            formProps={{
                sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'unset', // Remove the border
                    },
                },
            }}
        />
    );
});

export default CellEditor;
