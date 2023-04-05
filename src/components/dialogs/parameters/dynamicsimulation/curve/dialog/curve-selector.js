/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import EquipmentFilter, { EQUIPMENT_TYPE } from './equipment-filter';
import ModelFilter from './model-filter';
import { FormattedMessage } from 'react-intl';
import React, { useCallback, useState } from 'react';
import { useTheme } from '@mui/styles';

const CurveSelector = (props) => {
    const [modelFilterRevision, setModelFilterRevision] = useState(0);
    const [equipmentType, setEquipmentType] = useState(
        EQUIPMENT_TYPE.GENERATOR
    );

    const handleChangeEquipmentType = useCallback((newEquipmentType) => {
        setEquipmentType(newEquipmentType);
        // to force remount component since it has internal state
        setModelFilterRevision((prev) => ++prev);
    }, []);

    const theme = useTheme();
    return (
        <>
            <Grid
                item
                container
                xs={6}
                direction={'column'}
                alignItems={'flex-start'}
                justifyContent={'flex-start'}
                spacing={1}
            >
                <Typography
                    sx={{ marginBottom: theme.spacing(2) }}
                    variant="h6"
                >
                    <FormattedMessage
                        id={'DynamicSimulationCurveEquipmentFilter'}
                    ></FormattedMessage>
                </Typography>
                <EquipmentFilter
                    equipmentType={equipmentType}
                    onChangeEquipmentType={handleChangeEquipmentType}
                />
            </Grid>
            <Grid
                item
                container
                xs={6}
                direction={'column'}
                alignItems={'flex-start'}
                justifyContent={'flex-start'}
                spacing={1}
            >
                <Typography
                    sx={{ marginBottom: theme.spacing(2) }}
                    variant="h6"
                >
                    <FormattedMessage
                        id={'DynamicSimulationCurveCurveFilter'}
                    ></FormattedMessage>
                </Typography>
                <ModelFilter
                    key={`model-filter-${modelFilterRevision}`}
                    equipmentType={equipmentType}
                />
            </Grid>
        </>
    );
};

export default CurveSelector;
