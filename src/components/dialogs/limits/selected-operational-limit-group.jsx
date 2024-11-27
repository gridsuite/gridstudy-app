/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Box } from '@mui/material';
import { SelectInput } from '@gridsuite/commons-ui';

// TODO passer ça en typescript
export const SelectedOperationalLimitGroup = ({
                                                  indexLimitSet, // TODO rendre ça dynamique et déclencheur
                                                  formName,
                                                  optionsFormName,
                                              }) => {
    const { getValues } = useFormContext();
    const [ limitSets, setLimitSets ] = useState(["nimp"]);

    useEffect(() => {
        let allLimitSets = [];
        console.log("Mathieu optionsFormName : " + optionsFormName);
        console.log("Mathieu getValues(optionsFormName) : " + JSON.stringify(getValues(optionsFormName), null, 4));
        if (getValues(optionsFormName).length > 0) {
            console.log("Mathieu getValues(optionsFormName).length : " + JSON.stringify(getValues(optionsFormName).length));
            let val = getValues(optionsFormName)[0].id;
            console.log("Mathieu getValues val : " + val);
            allLimitSets.push(val);
        }

        setLimitSets(allLimitSets);
    }, [getValues, optionsFormName]);

    return (
        <Box sx={{ maxWidth: 300 }}>
            <SelectInput
                name={formName}
                options={limitSets}
                label={'SelectedOperationalLimitGroup'}
                size={'small'}
                onChangeCallback={{}}
            />
        </Box>
    );
};
