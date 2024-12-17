/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { Box } from '@mui/material';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { CurrentLimitsData } from './limits-type';

export interface SelectedOperationalLimitGroupProps {
    selectedFormName: string;
    optionsFormName: string;
}

export const SelectedOperationalLimitGroup = ({
    selectedFormName,
    optionsFormName,
}: Readonly<SelectedOperationalLimitGroupProps>) => {
    const optionsValues: CurrentLimitsData[] = useWatch({
        name: optionsFormName,
    });

    const limitSets: string[] = useMemo(
        () => optionsValues.map((optionObj: CurrentLimitsData) => optionObj.operationalLimitGroupId),
        [optionsValues]
    );

    return (
        <Box sx={{ maxWidth: 300 }}>
            <AutocompleteInput
                name={selectedFormName}
                options={limitSets}
                label={'SelectedOperationalLimitGroup'}
                size={'small'}
                allowNewValue
            />
        </Box>
    );
};
