/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import EquipmentFilter from './equipment-filter';
import ModelFilter from './model-filter';
import { FormattedMessage } from 'react-intl';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import { getReferencedEquipmentTypeForModel } from './curve-selector-utils';

const styles = {
    h6: (theme) => ({
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    }),
};

const CurveSelector = forwardRef((props, ref) => {
    const equipmentFilterRef = useRef();
    const modelFilterRef = useRef();

    const [equipmentType, setEquipmentType] = useState(EQUIPMENT_TYPES.GENERATOR);

    const handleChangeEquipmentType = useCallback((newEquipmentType) => {
        setEquipmentType(newEquipmentType);
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
                <Typography sx={styles.h6} variant="h6">
                    <FormattedMessage id={'DynamicSimulationCurveEquipmentFilter'}></FormattedMessage>
                </Typography>
                <EquipmentFilter
                    ref={equipmentFilterRef}
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
                <Typography sx={styles.h6} variant="h6">
                    <FormattedMessage id={'DynamicSimulationCurveCurveFilter'}></FormattedMessage>
                </Typography>
                <ModelFilter ref={modelFilterRef} equipmentType={getReferencedEquipmentTypeForModel(equipmentType)} />
            </Grid>
        </>
    );
});

export default CurveSelector;
