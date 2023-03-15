/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    compareById,
    filledTextField,
    gridItem,
} from 'components/dialogs/dialogUtils';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { EQUIPMENT_ID, TYPE } from 'components/refactor/utils/field-constants';
import { areIdsEqual, getObjectId } from 'components/refactor/utils/utils';
import { EQUIPMENT_TYPES } from '../../../util/equipment-types';

const richTypeEquals = (a, b) => a.type === b.type;

const DeleteEquipmentForm = ({ studyUuid, currentNode }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const watchType = useWatch({
        name: TYPE,
    });

    const { setValue } = useFormContext();

    const richTypeLabel = (rt) => {
        return intl.formatMessage({ id: rt.type });
    };

    const [equipmentsOptions, setEquipmentsOptions] = useState([]);

    const typesOptions = useMemo(() => {
        const equipmentTypesToExclude = new Set([
            EQUIPMENT_TYPES.SWITCH.type,
            EQUIPMENT_TYPES.LCC_CONVERTER_STATION.type,
            EQUIPMENT_TYPES.VSC_CONVERTER_STATION.type,
        ]);
        const ret = Object.values(EQUIPMENT_TYPES).filter(
            (equipmentType) => !equipmentTypesToExclude.has(equipmentType.type)
        );
        return ret;
    }, []);

    useEffect(() => {
        setEquipmentsOptions([]);
        if (watchType?.fetchers?.length) {
            Promise.all(
                watchType.fetchers.map((fetchPromise) =>
                    fetchPromise(studyUuid, currentNode.id)
                )
            )
                .then((vals) => {
                    setEquipmentsOptions(vals.flat().sort(compareById));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'equipmentsLoadingError',
                    });
                });
        }
    }, [studyUuid, currentNode?.id, watchType, snackError]);

    const handleChange = useCallback(() => {
        setValue(EQUIPMENT_ID, null);
    }, [setValue]);

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

    const equipmentField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={EQUIPMENT_ID}
            label="ID"
            options={equipmentsOptions}
            getOptionLabel={getObjectId}
            //hack to work with freesolo autocomplete
            //setting null programatically when freesolo is enable wont empty the field
            inputTransform={(value) => (value === null ? '' : value)}
            outputTransform={(value) =>
                value === '' ? null : getObjectId(value)
            }
            size={'small'}
            formProps={filledTextField}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(equipmentTypeField, 6)}
                {gridItem(equipmentField, 6)}
            </Grid>
        </>
    );
};

export default DeleteEquipmentForm;
