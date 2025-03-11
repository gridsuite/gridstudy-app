/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Theme, Typography } from '@mui/material';
import EquipmentFilter, { GetSelectedEquipmentsHandle } from './equipment-filter';
import ModelFilter, { GetSelectedVariablesHandle } from './model-filter';
import { FormattedMessage } from 'react-intl';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import { getReferencedEquipmentTypeForModel } from './curve-selector-utils';
import { IdentifiableAttributes } from 'services/study/filter';
import { ModelVariable } from '../../dynamic-simulation.type';

const styles = {
    h6: (theme: Theme) => ({
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    }),
};

export interface GetSelectedItemsHandler {
    api: {
        getSelectedEquipments: () => IdentifiableAttributes[];
        getSelectedVariables: () => ModelVariable[];
    };
}

const CurveSelector = forwardRef<GetSelectedItemsHandler>((props, ref) => {
    const equipmentFilterRef = useRef<GetSelectedEquipmentsHandle>(null);
    const modelFilterRef = useRef<GetSelectedVariablesHandle>(null);

    const [equipmentType, setEquipmentType] = useState(EQUIPMENT_TYPES.GENERATOR);

    const handleChangeEquipmentType = useCallback((newEquipmentType: EQUIPMENT_TYPES) => {
        setEquipmentType(newEquipmentType);
    }, []);

    // expose some api for the component by using ref
    useImperativeHandle(
        ref,
        () => ({
            api: {
                getSelectedEquipments: () => {
                    if (!equipmentFilterRef.current) {
                        return [];
                    }
                    return equipmentFilterRef.current.api.getSelectedEquipments();
                },
                getSelectedVariables: () => {
                    if (!modelFilterRef.current) {
                        return [];
                    }
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
