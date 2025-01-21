/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LIMITS, OPERATIONAL_LIMITS_GROUPS_1, OPERATIONAL_LIMITS_GROUPS_2 } from '../../utils/field-constants';
import React, { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeft from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { limitsStyles } from './operational-limits-groups-tabs';

export interface CopyLimitsProps {
    id?: string;
    indexSelectedLimitSet1: number;
    indexSelectedLimitSet2: number;
}

export function CopyLimits({ id = LIMITS, indexSelectedLimitSet1, indexSelectedLimitSet2 }: Readonly<CopyLimitsProps>) {
    const { getValues } = useFormContext();
    const { update: updateLimitsGroups1 } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const { update: updateLimitsGroups2 } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });

    const copyToRight = useCallback(() => {
        updateLimitsGroups2(
            indexSelectedLimitSet2,
            getValues(`${id}.${OPERATIONAL_LIMITS_GROUPS_1}[${indexSelectedLimitSet1}]`)
        );
    }, [id, getValues, updateLimitsGroups2, indexSelectedLimitSet1, indexSelectedLimitSet2]);

    const copyToLeft = useCallback(() => {
        updateLimitsGroups1(
            indexSelectedLimitSet1,
            getValues(`${id}.${OPERATIONAL_LIMITS_GROUPS_2}[${indexSelectedLimitSet2}]`)
        );
    }, [id, getValues, updateLimitsGroups1, indexSelectedLimitSet1, indexSelectedLimitSet2]);

    return (
        <>
            <Box sx={limitsStyles.copyLimitsToRightBackground}>
                <Button onClick={() => copyToRight()} sx={limitsStyles.copyLimitsButtons}>
                    <KeyboardDoubleArrowRight />
                </Button>
            </Box>
            <Box sx={limitsStyles.copyLimitsToLeftBackground}>
                <Button onClick={() => copyToLeft()} sx={limitsStyles.copyLimitsButtons}>
                    <KeyboardDoubleArrowLeft />
                </Button>
            </Box>
        </>
    );
}
