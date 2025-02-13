/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSnackMessage, AutocompleteInput } from '@gridsuite/commons-ui';
import { filledTextField } from 'components/dialogs/dialog-utils';
import {
    DELETION_SPECIFIC_DATA,
    EQUIPMENT_ID,
    HVDC_LINE_LCC_DELETION_SPECIFIC_TYPE,
    TYPE,
} from 'components/utils/field-constants';
import { areIdsEqual, getObjectId, richTypeEquals } from 'components/utils/utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import HvdcLccDeletionSpecificForm from './hvdc-lcc-deletion/hvdc-lcc-deletion-specific-form';
import useHvdcLccDeletion from './hvdc-lcc-deletion/hvdc-lcc-deletion-utils';

import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import useGetLabelEquipmentTypes from '../../../../hooks/use-get-label-equipment-types';
import GridItem from '../../commons/grid-item';

const DeleteEquipmentForm = ({ studyUuid, currentNode, currentRootNetworkUuid, editData }) => {
    const { snackError } = useSnackMessage();
    const editedIdRef = useRef(null);
    const currentTypeRef = useRef(null);

    const watchType = useWatch({
        name: TYPE,
    });
    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });
    const watchSpecificData = useWatch({
        name: DELETION_SPECIFIC_DATA,
    });
    const { specificUpdate: hvdcLccSpecificUpdate } = useHvdcLccDeletion();
    const { setValue } = useFormContext();

    const getOptionLabel = useGetLabelEquipmentTypes();

    const [equipmentsOptions, setEquipmentsOptions] = useState([]);

    const typesOptions = useMemo(() => {
        const equipmentTypesToExclude = new Set([
            EQUIPMENT_TYPES.SWITCH,
            EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
            EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
            EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            EQUIPMENT_TYPES.BUS,
            EQUIPMENT_TYPES.BUSBAR_SECTION,
            EQUIPMENT_TYPES.TIE_LINE,
            EQUIPMENT_TYPES.BREAKER,
            EQUIPMENT_TYPES.DISCONNECTOR,
        ]);
        return Object.values(EQUIPMENT_TYPES).filter((equipmentType) => !equipmentTypesToExclude.has(equipmentType));
    }, []);

    useEffect(() => {
        setEquipmentsOptions([]);
        if (watchType) {
            if (watchType !== currentTypeRef.current) {
                currentTypeRef.current = watchType;
            }
            let ignore = false;
            fetchEquipmentsIds(studyUuid, currentNode?.id, currentRootNetworkUuid, undefined, watchType, true)
                .then((vals) => {
                    // check race condition here
                    if (!ignore) {
                        setEquipmentsOptions(vals.sort());
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'equipmentsLoadingError',
                    });
                });
            return () => {
                ignore = true;
            };
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid, watchType, snackError]);

    useEffect(() => {
        if (studyUuid && currentNode?.id && currentRootNetworkUuid) {
            if (editData?.equipmentId) {
                if (editedIdRef.current === null) {
                    // The first time we render an edition, we want to merge the
                    // dynamic data with the edition data coming from the database
                    editedIdRef.current = editData.equipmentId;
                } else if (watchEquipmentId !== editedIdRef.current && editedIdRef.current !== '') {
                    // we have changed eqptId, leave the "first edit" mode (then if we circle back
                    // to editData?.equipmentId, we wont make the merge anymore).
                    editedIdRef.current = '';
                }
            }

            if (watchEquipmentId && currentTypeRef.current === EQUIPMENT_TYPES.HVDC_LINE) {
                // need specific update related to HVDC LCC deletion (for MCS lists)
                hvdcLccSpecificUpdate(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
                    watchEquipmentId,
                    watchEquipmentId === editedIdRef.current ? editData : null
                );
            } else {
                setValue(DELETION_SPECIFIC_DATA, null);
            }
        }
    }, [
        studyUuid,
        currentNode?.id,
        currentRootNetworkUuid,
        watchEquipmentId,
        snackError,
        setValue,
        hvdcLccSpecificUpdate,
        editData,
    ]);

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
            getOptionLabel={getOptionLabel}
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
            inputTransform={(value) => value}
            outputTransform={(value) => (value === '' ? null : getObjectId(value))}
            size={'small'}
            formProps={filledTextField}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem>{equipmentTypeField}</GridItem>
                <GridItem>{equipmentField}</GridItem>
            </Grid>
            {watchSpecificData?.specificType === HVDC_LINE_LCC_DELETION_SPECIFIC_TYPE && (
                <HvdcLccDeletionSpecificForm />
            )}
        </>
    );
};

export default DeleteEquipmentForm;
