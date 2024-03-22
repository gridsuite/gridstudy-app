/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { TextInput, useSnackMessage } from '@gridsuite/commons-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER_SETPOINT,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    NOMINAL_V,
    R,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    MAX_P,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P0,
} from '../../../../utils/field-constants';
import Grid from '@mui/material/Grid';
import {
    filledTextField,
    gridItem,
    sanitizeString,
} from '../../../dialogUtils';
import VscTabs from '../vsc-tabs';
import { Box } from '@mui/system';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import {
    getVscHvdcLinePaneEmptyFormData,
    getVscHvdcLinePaneSchema,
    getVscHvdcLineTabFormData,
} from '../hvdc-line-pane/vsc-hvdc-line-pane-utils';
import { FetchStatus } from '../../../../../services/utils';
import {
    getConverterStationCreationData,
    getConverterStationFormEditData,
    getConverterStationFromSearchCopy,
    getVscConverterStationEmptyFormData,
    getVscConverterStationSchema,
} from '../converter-station/converter-station-utils';
import VscCreationForm from './vsc-creation-form';
import { createVsc } from '../../../../../services/study/network-modifications';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import EquipmentSearchDialog from '../../../equipment-search-dialog';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getVscHvdcLinePaneSchema(HVDC_LINE_TAB),
        ...getVscConverterStationSchema(CONVERTER_STATION_1),
        ...getVscConverterStationSchema(CONVERTER_STATION_2),
    })
    .required();
const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getVscHvdcLinePaneEmptyFormData(HVDC_LINE_TAB, false),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_1),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_2),
};

export const VSC_CREATION_TABS = {
    HVDC_LINE_TAB: 0,
    CONVERTER_STATION_1: 1,
    CONVERTER_STATION_2: 2,
};

const VscCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState(VSC_CREATION_TABS.HVDC_LINE_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const fromSearchCopyToFormValues = (hvdcLine) => {
        reset({
            [EQUIPMENT_ID]: hvdcLine.id + '(1)',
            [EQUIPMENT_NAME]: hvdcLine.name ?? '',
            ...getVscHvdcLineTabFormData(HVDC_LINE_TAB, {
                nominalV: hvdcLine.nominalV,
                r: hvdcLine.r,
                maxP: hvdcLine.maxP,
                operatorActivePowerLimitFromSide1ToSide2:
                    hvdcLine.hvdcOperatorActivePowerRange?.oprFromCS1toCS2,
                operatorActivePowerLimitFromSide2ToSide1:
                    hvdcLine.hvdcOperatorActivePowerRange?.oprFromCS2toCS1,
                convertersMode: hvdcLine.convertersMode,
                activePowerSetpoint: hvdcLine.activePowerSetpoint,
                angleDroopActivePowerControl:
                    hvdcLine.hvdcAngleDroopActivePowerControl?.isEnabled,
                p0: hvdcLine.hvdcAngleDroopActivePowerControl?.p0,
                droop: hvdcLine.hvdcAngleDroopActivePowerControl?.droop,
            }),
            ...getConverterStationFromSearchCopy(
                CONVERTER_STATION_1,
                hvdcLine.converterStation1
            ),
            ...getConverterStationFromSearchCopy(
                CONVERTER_STATION_2,
                hvdcLine.converterStation2
            ),
        });
    };

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.HVDC_LINE,
    });

    const generatorIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const generatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const headersAndTabs = (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container spacing={2}>
                {gridItem(generatorIdField, 4)}
                {gridItem(generatorNameField, 4)}
            </Grid>
            <VscTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
            />
        </Box>
    );

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData?.equipmentName ?? '',
                ...getVscHvdcLineTabFormData(HVDC_LINE_TAB, editData),
                ...getConverterStationFormEditData(
                    CONVERTER_STATION_1,
                    editData.converterStation1
                ),
                ...getConverterStationFormEditData(
                    CONVERTER_STATION_2,
                    editData.converterStation2
                ),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[HVDC_LINE_TAB] !== undefined) {
            tabsInError.push(VSC_CREATION_TABS.HVDC_LINE_TAB);
        }
        if (errors?.[CONVERTER_STATION_1] !== undefined) {
            tabsInError.push(VSC_CREATION_TABS.CONVERTER_STATION_1);
        }

        if (errors?.[CONVERTER_STATION_2] !== undefined) {
            tabsInError.push(VSC_CREATION_TABS.CONVERTER_STATION_2);
        }

        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }

        setTabIndexesWithError(tabsInError);
    };

    const onSubmit = useCallback(
        (hvdcLine) => {
            const hvdcLineTab = hvdcLine[HVDC_LINE_TAB];
            const converterStation1 = getConverterStationCreationData(
                hvdcLine[CONVERTER_STATION_1]
            );
            const converterStation2 = getConverterStationCreationData(
                hvdcLine[CONVERTER_STATION_2]
            );
            createVsc(
                studyUuid,
                currentNodeUuid,
                hvdcLine[EQUIPMENT_ID],
                sanitizeString(hvdcLine[EQUIPMENT_NAME]),
                hvdcLineTab[NOMINAL_V],
                hvdcLineTab[R],
                hvdcLineTab[MAX_P],
                hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE1],
                hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE2],
                hvdcLineTab[CONVERTERS_MODE],
                hvdcLineTab[ACTIVE_POWER_SETPOINT],
                hvdcLineTab[ANGLE_DROOP_ACTIVE_POWER_CONTROL],
                hvdcLineTab[P0],
                hvdcLineTab[DROOP],
                converterStation1,
                converterStation2,
                !!editData,
                editData?.uuid ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VscCreationError',
                });
            });
        },
        [studyUuid, currentNodeUuid, editData, snackError]
    );

    return (
        <FormProvider {...formMethods} validationSchema={formSchema}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidationError={onValidationError}
                onSave={onSubmit}
                aria-labelledby="dialog-create-vsc"
                maxWidth={'md'}
                titleId="CreateVsc"
                subtitle={headersAndTabs}
                searchCopy={searchCopy}
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <VscCreationForm
                    tabIndex={tabIndex}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.HVDC_LINE}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default VscCreationDialog;
