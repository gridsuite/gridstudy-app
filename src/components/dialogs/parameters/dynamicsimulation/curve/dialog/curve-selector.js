/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography, useTheme } from '@mui/material';
import EquipmentFilter, { CURVE_EQUIPMENTS } from './equipment-filter';
import ModelFilter from './model-filter';
import { FormattedMessage } from 'react-intl';
import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const CurveSelector = forwardRef((props, ref) => {
    const theme = useTheme();

    const equipmentFilterRef = useRef();
    const modelFilterRef = useRef();

    const [equipment, setEquipment] = useState(CURVE_EQUIPMENTS.GENERATOR);

    const handleChangeEquipment = useCallback((newEquipment) => {
        setEquipment(newEquipment);
    }, []);

    // expose some api for the component by using ref
    useImperativeHandle(
        ref,
        () => ({
            api: {
                getSelectedEquipments: () => {
                    return equipmentFilterRef.current.api.getSelectedEquipments();
                },
                getSelectedVariables: () => {
                    return modelFilterRef.current.api.getSelectedVariables();
                },
            },
        }),
        []
    );

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
                    ref={equipmentFilterRef}
                    equipment={equipment}
                    onChangeEquipment={handleChangeEquipment}
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
                <ModelFilter ref={modelFilterRef} equipment={equipment} />
            </Grid>
        </>
    );
});

export default CurveSelector;
