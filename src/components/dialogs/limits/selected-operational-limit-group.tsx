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
import { APPLICABILITY } from '../../network/constants';
import { useIntl } from 'react-intl';
import { OperationalLimitsGroupFormInfos } from '../network-modifications/line/modification/line-modification-type';

export interface SelectedOperationalLimitGroupProps {
    selectedFormName: string;
    optionsFormName: string;
    label?: string;
    filteredApplicability?: string;
    previousValue?: string;
    isABranchModif: boolean; // if false, this is a branch creation
}

export const SelectedOperationalLimitGroup = ({
    selectedFormName,
    optionsFormName,
    label,
    filteredApplicability,
    previousValue,
    isABranchModif,
}: Readonly<SelectedOperationalLimitGroupProps>) => {
    const optionsValues = useWatch({
        name: optionsFormName,
    });
    const intl = useIntl();

    const opLimitsGroupsNames: string[] = useMemo((): string[] => {
        const finalOptions: string[] = optionsValues
            ? optionsValues
                  .filter(
                      (optionObj: OperationalLimitsGroupFormInfos) =>
                          optionObj.applicability &&
                          (optionObj.applicability === filteredApplicability ||
                              optionObj.applicability === APPLICABILITY.EQUIPMENT.id)
                  )
                  .map((filteredoptionObj: OperationalLimitsGroupFormInfos) => filteredoptionObj.name)
                  .filter((id: string) => id != null)
            : [];
        if (isABranchModif) {
            finalOptions.push(
                intl.formatMessage({
                    id: 'None',
                })
            );
        }
        return finalOptions;
    }, [filteredApplicability, intl, isABranchModif, optionsValues]);

    return (
        <Box sx={{ maxWidth: 300 }}>
            <AutocompleteInput
                name={selectedFormName}
                options={opLimitsGroupsNames}
                label={label ?? 'SelectedOperationalLimitGroup'}
                size={'small'}
                previousValue={previousValue}
                allowNewValue={isABranchModif}
            />
        </Box>
    );
};
