/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import { TextInput, useSnackMessage } from '@gridsuite/commons-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTER_STATION_ID,
    CONVERTERS_MODE,
    DC_NOMINAL_VOLTAGE,
    DC_RESISTANCE,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    MAXIMUM_ACTIVE_POWER,
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
import VscHvdcLinePane, {
    getVscHvdcLinePaneEmptyFormData,
    getVscHvdcLinePaneSchema,
} from '../hvdc-line-pane/vsc-hvdc-line-pane';
import { FetchStatus } from '../../../../../services/utils';
import ConverterStationPane, {
    getConverterStationCreationData,
    getVscConverterStationEmptyFormData,
    getVscConverterStationSchema,
} from '../converter-station/converter-station-utils';
import VscCreationForm from './vsc-creation-form';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { createVsc } from '../../../../../services/study/network-modifications';
import EquipmentSearchDialog from "../../../equipment-search-dialog";

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
    ...getVscHvdcLinePaneEmptyFormData(HVDC_LINE_TAB),
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
    const empty: number[] = [];
    const [tabIndexesWithError, setTabIndexesWithError] = useState(empty);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const fromSearchCopyToFormValues = (hvdcLine) => {
        console.log('hvdcLine : ', hvdcLine);
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.GENERATOR,
    });

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
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
    console.log('editData : ', editData);

    const { reset, setValue } = formMethods;
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onValidationError = (errors: any) => {
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
        setTabIndexesWithError(tabsInError);
    };

    const onSubmit = useCallback((hvdcLine) => {
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
            hvdcLine[DC_NOMINAL_VOLTAGE],
            hvdcLine[DC_RESISTANCE],
            hvdcLine[MAXIMUM_ACTIVE_POWER],
            hvdcLine[OPERATOR_ACTIVE_POWER_LIMIT_SIDE1],
            hvdcLine[OPERATOR_ACTIVE_POWER_LIMIT_SIDE2],
            hvdcLine[CONVERTERS_MODE],
            hvdcLine[ACTIVE_POWER],
            hvdcLine[ANGLE_DROOP_ACTIVE_POWER_CONTROL],
            hvdcLine[P0],
            hvdcLine[DROOP],
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
    }, []);

    return (
        <FormProvider {...formMethods} validationSchema={formSchema}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidationError={onValidationError}
                onSave={onSubmit}
                aria-labelledby="dialog-create-line"
                maxWidth={'md'}
                titleId="CreateLine"
                subtitle={headersAndTabs}
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
