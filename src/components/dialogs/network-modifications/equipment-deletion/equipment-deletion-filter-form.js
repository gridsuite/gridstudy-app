/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    useSnackMessage,
    AutocompleteInput,
    elementType,
} from '@gridsuite/commons-ui';
import { filledTextField, gridItem } from 'components/dialogs/dialogUtils';
import { FILTERS, TYPE } from 'components/utils/field-constants';
import { richTypeEquals } from 'components/utils/utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

import DirectoryItemsInput from '../../../utils/rhf-inputs/directory-items-input';

const DeleteFilterEquipmentForm = ({ studyUuid, currentNode, editData }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const editedIdRef = useRef(null);

    const equipmentTypeWatch = useWatch({
        name: TYPE,
    });
    const watchFilters = useWatch({
        name: FILTERS,
    });
    const { setValue } = useFormContext();

    const richTypeLabel = (rt) => {
        return intl.formatMessage({ id: rt });
    };

    const typesOptions = useMemo(() => {
        const equipmentTypesToExclude = new Set([
            EQUIPMENT_TYPES.SWITCH,
            EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
            EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
            EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            EQUIPMENT_TYPES.BUS,
            EQUIPMENT_TYPES.HVDC_LINE, //exclude HVDC line
        ]);
        return Object.values(EQUIPMENT_TYPES).filter(
            (equipmentType) => !equipmentTypesToExclude.has(equipmentType)
        );
    }, []);

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            if (editData?.equipmentId) {
                if (editedIdRef.current === null) {
                    // The first time we render an edition, we want to merge the
                    // dynamic data with the edition data coming from the database
                    editedIdRef.current = editData.equipmentId;
                } else if (
                    watchFilters !== editedIdRef.current &&
                    editedIdRef.current !== ''
                ) {
                    // we have changed eqptId, leave the "first edit" mode (then if we circle back
                    // to editData?.equipmentId, we wont make the merge anymore).
                    editedIdRef.current = '';
                }
            }
        }
    }, [
        studyUuid,
        currentNode?.id,
        watchFilters,
        snackError,
        setValue,
        editData,
    ]);

    const handleChange = useCallback(() => {
        setValue(FILTERS, []);
    }, [setValue]);

    const filtersField = useMemo(() => {
        return (
            <DirectoryItemsInput
                name={FILTERS}
                elementType={elementType.FILTER}
                titleId={'FiltersListsSelection'}
                label={'filter'}
                equipmentTypes={[equipmentTypeWatch]}
                disable={!equipmentTypeWatch}
            />
        );
    }, [equipmentTypeWatch]);

    const equipmentTypeField = (
        <AutocompleteInput
            isOptionEqualToValue={richTypeEquals}
            name={TYPE}
            label="Type"
            options={typesOptions}
            onChangeCallback={handleChange}
            getOptionLabel={richTypeLabel}
            size={'small'}
            formProps={filledTextField}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(equipmentTypeField, 6)}
                {gridItem(filtersField, 6)}
            </Grid>
        </>
    );
};

export default DeleteFilterEquipmentForm;
