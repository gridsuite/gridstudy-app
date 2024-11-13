/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput, DirectoryItemsInput, ElementType } from '@gridsuite/commons-ui';
import { FILTERS, TYPE } from 'components/utils/field-constants';
import { richTypeEquals } from 'components/utils/utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import useGetLabelEquipmentTypes from '../../../../../hooks/use-get-label-equipment-types';
import GridItem from '../../../commons/grid-item';

const ByFilterDeletionForm = () => {
    const equipmentTypeWatch = useWatch({
        name: TYPE,
    });

    const { setValue } = useFormContext();

    const getOptionLabel = useGetLabelEquipmentTypes();

    const typesOptions = useMemo(() => {
        const equipmentTypesToExclude = new Set([
            EQUIPMENT_TYPES.SWITCH,
            EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
            EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
            EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            EQUIPMENT_TYPES.BUS,
            EQUIPMENT_TYPES.BUSBAR_SECTION,
            EQUIPMENT_TYPES.TIE_LINE,
        ]);
        return Object.values(EQUIPMENT_TYPES).filter((equipmentType) => !equipmentTypesToExclude.has(equipmentType));
    }, []);

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
        <>
            <Grid container spacing={2}>
                <GridItem>{equipmentTypeField}</GridItem>
                <GridItem>{filtersField}</GridItem>
            </Grid>
        </>
    );
};

export default ByFilterDeletionForm;
