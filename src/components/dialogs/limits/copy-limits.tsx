/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { OPERATIONAL_LIMITS_GROUPS_1, OPERATIONAL_LIMITS_GROUPS_2 } from '../../utils/field-constants';
import { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeft from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { limitsStyles } from './operational-limits-groups-tabs';

export interface CopyLimitsProps {
    parentFormName: string;
    indexSelectedLimitSet1: number | null;
    indexSelectedLimitSet2: number | null;
}

export function CopyLimits({
    parentFormName,
    indexSelectedLimitSet1,
    indexSelectedLimitSet2,
}: Readonly<CopyLimitsProps>) {
    const { getValues } = useFormContext();
    const { update: updateLimitsGroups1 } = useFieldArray({
        name: `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const { update: updateLimitsGroups2 } = useFieldArray({
        name: `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });

    const copyToRight = useCallback(() => {
        if (indexSelectedLimitSet2 !== null) {
            updateLimitsGroups2(
                indexSelectedLimitSet2,
                getValues(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}[${indexSelectedLimitSet1}]`)
            );
        }
    }, [parentFormName, getValues, updateLimitsGroups2, indexSelectedLimitSet1, indexSelectedLimitSet2]);

    const copyToLeft = useCallback(() => {
        if (indexSelectedLimitSet1 != null) {
            updateLimitsGroups1(
                indexSelectedLimitSet1,
                getValues(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_2}[${indexSelectedLimitSet2}]`)
            );
        }
    }, [parentFormName, getValues, updateLimitsGroups1, indexSelectedLimitSet1, indexSelectedLimitSet2]);

    return (
        <>
            <Box sx={limitsStyles.copyLimitsToRightBackground}>
                <Button
                    onClick={copyToRight}
                    disabled={indexSelectedLimitSet1 === null}
                    sx={limitsStyles.copyLimitsButtons}
                >
                    <KeyboardDoubleArrowRight />
                </Button>
            </Box>
            <Box sx={limitsStyles.copyLimitsToLeftBackground}>
                <Button
                    onClick={copyToLeft}
                    disabled={indexSelectedLimitSet2 === null}
                    sx={limitsStyles.copyLimitsButtons}
                >
                    <KeyboardDoubleArrowLeft />
                </Button>
            </Box>
        </>
    );
}
