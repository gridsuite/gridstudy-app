/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from "react";
import { TextInput, useSnackMessage } from "@gridsuite/commons-ui";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB
} from "../../../../utils/field-constants";
import Grid from "@mui/material/Grid";
import { filledTextField, gridItem } from "../../../dialogUtils";
import VscTabs from "../vsc-tabs";
import { Box } from "@mui/system";
import yup from "components/utils/yup-config";
import ModificationDialog from "../../../commons/modificationDialog";
import { FORM_LOADING_DELAY } from "../../../../network/constants";
import { useOpenShortWaitFetching } from "../../../commons/handle-modification-form";
import VscHvdcLinePane, { getVscHvdcLinePaneSchema } from "../hvdc-line-pane/vsc-hvdc-line-pane";
import { FetchStatus } from "../../../../../services/utils";

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getVscHvdcLinePaneSchema(HVDC_LINE_TAB),
    })
    .required();
const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
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
    dialogProps,
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

    const onSubmit = useCallback((vsc: any) => {}, []);
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
                <Box
                    hidden={tabIndex !== VSC_CREATION_TABS.HVDC_LINE_TAB}
                    p={1}
                >
                    <VscHvdcLinePane id={HVDC_LINE_TAB} />
                </Box>
            </ModificationDialog>
        </FormProvider>
    );
};

export default VscCreationDialog;
