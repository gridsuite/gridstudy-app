/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    AutocompleteInput,
    DirectoryItemsInput,
    ElementType,
    EquipmentType,
    useGetLabelEquipmentTypes,
} from '@gridsuite/commons-ui';
import { FILTERS, TYPE } from 'components/utils/field-constants';
import { richTypeEquals } from 'components/utils/utils';
import GridItem from '../../../commons/grid-item';

const ByFilterDeletionForm = () => {
    const equipmentTypeWatch = useWatch({
        name: TYPE,
    });

    const { setValue } = useFormContext();

    const getOptionLabel = useGetLabelEquipmentTypes();

    const typesOptions = useMemo(
        () => [
            EquipmentType.SUBSTATION,
            EquipmentType.VOLTAGE_LEVEL,
            EquipmentType.LINE,
            EquipmentType.TWO_WINDINGS_TRANSFORMER,
            EquipmentType.THREE_WINDINGS_TRANSFORMER,
            EquipmentType.GENERATOR,
            EquipmentType.BATTERY,
            EquipmentType.LOAD,
            EquipmentType.SHUNT_COMPENSATOR,
            EquipmentType.STATIC_VAR_COMPENSATOR,
            EquipmentType.HVDC_LINE,
            EquipmentType.DANGLING_LINE,
        ],
        []
    );

    const handleEquipmentTypeChange = useCallback(() => {
        setValue(FILTERS, []);
    }, [setValue]);

    const filtersField = useMemo(() => {
        return (
            <DirectoryItemsInput
                key={equipmentTypeWatch} // force refresh on equipment type change
                name={FILTERS}
                elementType={ElementType.FILTER}
                titleId={'FiltersListsSelection'}
                label={'filter'}
                equipmentTypes={[equipmentTypeWatch]}
                disable={!equipmentTypeWatch}
            />
        );
    }, [equipmentTypeWatch]);

    const equipmentTypeField = useMemo(() => {
        return (
            <AutocompleteInput
                isOptionEqualToValue={richTypeEquals}
                name={TYPE}
                label="Type"
                options={typesOptions}
                onChangeCallback={handleEquipmentTypeChange}
                getOptionLabel={getOptionLabel}
                size={'small'}
                formProps={{ variant: 'filled' }}
            />
        );
    }, [handleEquipmentTypeChange, getOptionLabel, typesOptions]);

    return (
        <Grid container spacing={2} padding={0.5} alignItems={'center'}>
            <GridItem>{equipmentTypeField}</GridItem>
            <GridItem>{filtersField}</GridItem>
        </Grid>
    );
};

export default ByFilterDeletionForm;
