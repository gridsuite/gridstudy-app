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
import { APPLICABILITY } from '../../network/constants';

export interface SelectedOperationalLimitGroupProps {
    selectedFormName: string;
    optionsFormName: string;
    label?: string;
    filteredApplicability?: string;
}

export const SelectedOperationalLimitGroup = ({
    selectedFormName,
    optionsFormName,
    label,
    filteredApplicability,
}: Readonly<SelectedOperationalLimitGroupProps>) => {
    const optionsValues: OperationalLimitsGroup[] = useWatch({
        name: optionsFormName,
    });

    const opLimitsGroupsNames: string[] = useMemo(() => {
        return optionsValues
            ? optionsValues
                  .filter(
                      (optionObj: OperationalLimitsGroup) =>
                          optionObj.applicability &&
                          (optionObj.applicability === filteredApplicability ||
                              optionObj.applicability === APPLICABILITY.EQUIPMENT.id)
                  )
                  .map((filteredoptionObj: OperationalLimitsGroup) => filteredoptionObj.name)
                  .filter((id: string) => id != null)
            : [];
    }, [filteredApplicability, optionsValues]);

    return (
        <Box sx={{ maxWidth: 300 }}>
            <AutocompleteInput
                name={selectedFormName}
                options={opLimitsGroupsNames}
                label={label ?? 'SelectedOperationalLimitGroup'}
                size={'small'}
            />
        </Box>
    );
};
