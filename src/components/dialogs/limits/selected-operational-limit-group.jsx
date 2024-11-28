/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Box } from '@mui/material';
import { SelectInput } from '@gridsuite/commons-ui';

// TODO passer ça en typescript
export const SelectedOperationalLimitGroup = ({ selectedName, optionsFormName }) => {
    const [limitSets, setLimitSets] = useState([]);

    const optionsValues = useWatch({
        name: optionsFormName,
    });

    useEffect(() => {
        if (optionsValues.length > 0) {
            let allLimitSets = [];
            optionsValues.forEach((optionObj) => {
                allLimitSets.push({
                    id: optionObj.id,
                });
            });
            setLimitSets(allLimitSets);
        }
    }, [optionsValues]);

    return (
        <Box sx={{ maxWidth: 300 }}>
            <SelectInput
                name={selectedName}
                options={limitSets}
                label={'SelectedOperationalLimitGroup'}
                size={'small'}
            />
        </Box>
    );
};
