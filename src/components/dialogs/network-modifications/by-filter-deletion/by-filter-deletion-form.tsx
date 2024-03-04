/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput, elementType } from '@gridsuite/commons-ui';
import { gridItem } from 'components/dialogs/dialogUtils';
import { FILTERS, TYPE } from 'components/utils/field-constants';
import { richTypeEquals } from 'components/utils/utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

import DirectoryItemsInput from '../../../utils/rhf-inputs/directory-items-input';
import { getIdOrValue } from '../../commons/utils';

const ByFilterDeletionForm = () => {
    const intl = useIntl();

    const equipmentTypeWatch = useWatch({
        name: TYPE,
    });

    const { setValue } = useFormContext();

    const richTypeLabel = useMemo(
        () => (rt: { id: string; label: string } | string) => {
            return intl.formatMessage({ id: getIdOrValue(rt) });
        },
        [intl]
    );

    const typesOptions = useMemo(() => {
        const equipmentTypesToExclude = new Set([
            EQUIPMENT_TYPES.SWITCH,
            EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
            EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
            EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            EQUIPMENT_TYPES.BUS,
            EQUIPMENT_TYPES.BUSBAR_SECTION,
        ]);
        return Object.values(EQUIPMENT_TYPES).filter(
            (equipmentType) => !equipmentTypesToExclude.has(equipmentType)
        );
    }, []);

    const handleEquipmentTypeChange = useCallback(() => {
        setValue(FILTERS, []);
    }, [setValue]);

    const filtersField = useMemo(() => {
        return (
            <DirectoryItemsInput
                key={equipmentTypeWatch} // force refresh on equipment type change
                name={FILTERS}
                elementType={elementType.FILTER}
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
                getOptionLabel={richTypeLabel}
                size={'small'}
                formProps={{ variant: 'filled' }}
            />
        );
    }, [handleEquipmentTypeChange, richTypeLabel, typesOptions]);

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(equipmentTypeField, 6)}
                {gridItem(filtersField, 6)}
            </Grid>
        </>
    );
};

export default ByFilterDeletionForm;
