/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useIntl } from 'react-intl';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    compareById,
    filledTextField,
    gridItem,
    GridSection,
} from 'components/dialogs/dialogUtils';
import AutocompleteInput from 'components/utils/rhf-inputs/autocomplete-input';
import {
    EQUIPMENT_ID,
    HVDC_WITH_LCC,
    SHUNT_COMPENSATOR_SIDE_1,
    SHUNT_COMPENSATOR_SIDE_2,
    TYPE,
} from 'components/utils/field-constants';
import { areIdsEqual, getObjectId } from 'components/utils/utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import ShuntCompensatorSelectionForm from './shunt-compensator-selection-form';
import { fetchHvdcLineWithShuntCompensators } from '../../../../utils/rest-api';

const richTypeEquals = (a, b) => a.type === b.type;

const DeleteEquipmentForm = ({
    studyUuid,
    currentNode,
    editDataEquipmentId,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const editedIdRef = useRef(null);

    const watchType = useWatch({
        name: TYPE,
    });
    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });
    const watchIsLcc = useWatch({
        name: HVDC_WITH_LCC,
    });

    // replace is mandatory to update a fieldArray (not setValue)
    const { replace: replaceMcsList1, fields: mcsRows1 } = useFieldArray({
        name: SHUNT_COMPENSATOR_SIDE_1,
    });
    const { replace: replaceMcsList2, fields: mcsRows2 } = useFieldArray({
        name: SHUNT_COMPENSATOR_SIDE_2,
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
            EQUIPMENT_TYPES.HVDC_CONVERTER_STATION.type,
        ]);
        return Object.values(EQUIPMENT_TYPES).filter(
            (equipmentType) => !equipmentTypesToExclude.has(equipmentType.type)
        );
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

    const updateMcsList = useCallback(
        (hvdcLineData) => {
            const withLcc = hvdcLineData
                ? hvdcLineData.hvdcType === 'LCC'
                : false;
            setValue(HVDC_WITH_LCC, withLcc);
            replaceMcsList1(withLcc ? hvdcLineData.mcsOnSide1 : []);
            replaceMcsList2(withLcc ? hvdcLineData.mcsOnSide2 : []);
        },
        [setValue, replaceMcsList1, replaceMcsList2]
    );

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            if (editDataEquipmentId && !editedIdRef.current) {
                // In case of edition, dont dynamically change MCS lists on first render.
                // Keep user data as it is stored in database (cf editData)
                editedIdRef.current = editDataEquipmentId;
                return;
            }
            if (
                watchEquipmentId &&
                watchType?.type === EQUIPMENT_TYPES.HVDC_LINE.type
            ) {
                // need a specific rest call to get related MCS lists
                fetchHvdcLineWithShuntCompensators(
                    studyUuid,
                    currentNode?.id,
                    watchEquipmentId
                )
                    .then((hvdcLineData) => {
                        updateMcsList(hvdcLineData);
                    })
                    .catch((error) => {
                        updateMcsList(null);
                        snackError({
                            messageTxt: error.message,
                            headerId: 'HVDCLineConverterStationError',
                        });
                    });
            } else {
                updateMcsList(null);
            }
        }
    }, [
        studyUuid,
        currentNode?.id,
        watchType.type,
        watchEquipmentId,
        updateMcsList,
        snackError,
        editDataEquipmentId,
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

    const mscOnsideOne = (
        <ShuntCompensatorSelectionForm
            title="Side1"
            arrayFormName={SHUNT_COMPENSATOR_SIDE_1}
            mcsRows={mcsRows1}
        />
    );

    const mscOnsideTwo = (
        <ShuntCompensatorSelectionForm
            title="Side2"
            arrayFormName={SHUNT_COMPENSATOR_SIDE_2}
            mcsRows={mcsRows2}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(equipmentTypeField, 6)}
                {gridItem(equipmentField, 6)}
            </Grid>
            {watchIsLcc && (
                <Grid
                    container
                    spacing={1}
                    direction="column"
                    paddingTop={2}
                    paddingLeft={1}
                >
                    <GridSection
                        title="LCCConverterStationShuntCompensators"
                        heading="3"
                    />
                    <Grid container spacing={1}>
                        {gridItem(mscOnsideOne)}
                        {gridItem(mscOnsideTwo)}
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default DeleteEquipmentForm;
