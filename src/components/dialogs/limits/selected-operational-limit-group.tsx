/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { Box } from '@mui/material';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { OperationalLimitsGroup } from '../../../services/network-modification-types';

export interface SelectedOperationalLimitGroupProps {
    selectedFormName: string;
    optionsFormName: string;
}

export const SelectedOperationalLimitGroup = ({
    selectedFormName,
    optionsFormName,
}: Readonly<SelectedOperationalLimitGroupProps>) => {
    const optionsValues: OperationalLimitsGroup[] = useWatch({
        name: optionsFormName,
    });

    const opLimitsGroupsNames: string[] = useMemo(
        () =>
            optionsValues
                ? optionsValues
                      .map((optionObj: OperationalLimitsGroup) => optionObj.id)
                      .filter((id: string) => id != null)
                : [],
        [optionsValues]
    );

    return (
        <Box sx={{ maxWidth: 300 }}>
            <AutocompleteInput
                name={selectedFormName}
                options={opLimitsGroupsNames}
                label={'SelectedOperationalLimitGroup'}
                size={'small'}
                allowNewValue
            />
        </Box>
    );
};
