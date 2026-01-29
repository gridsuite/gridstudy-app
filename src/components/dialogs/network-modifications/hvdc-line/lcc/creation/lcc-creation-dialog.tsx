/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    CONNECTIVITY,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    CONVERTERS_MODE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FILTERS_SHUNT_COMPENSATOR_TABLE,
    HVDC_LINE_TAB,
    LOSS_FACTOR,
    MAX_P,
    NOMINAL_V,
    POWER_FACTOR,
    R,
} from '../../../../../utils/field-constants';
import yup from '../../../../../utils/yup-config';
import { useForm } from 'react-hook-form';
import { DeepNullable } from '../../../../../utils/ts-utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { LccDialogTab, LccCreationInfos, LccFormInfos, ShuntCompensatorFormSchema } from '../common/lcc-type';
import { Property, toModificationProperties } from '../../../common/properties/property-utils';
import {
    CustomFormProvider,
    EquipmentSearchDialog,
    ExtendedEquipmentType,
    FetchStatus,
    FORM_LOADING_DELAY,
    ModificationDialog,
    sanitizeString,
    snackWithFallback,
    useFormSearchCopy,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useState } from 'react';
import { createLcc } from '../../../../../../services/study/network-modifications';
import { Grid } from '@mui/material';
import LccCreationDialogHeader from './lcc-creation-dialog-header';
import LccTabs from '../common/lcc-tabs';
import LccCreationForm from './lcc-creation-form';
import {
    getLccConverterStationCreationData,
    getLccConverterStationEmptyFormData,
    getLccConverterStationFromEditData,
    getLccConverterStationFromSearchCopy,
    getLccConverterStationSchema,
    getLccHvdcLineEmptyFormData,
    getLccHvdcLineFromEditData,
    getLccHvdcLineFromSearchCopy,
    getLccHvdcLineSchema,
} from '../common/lcc-utils';
import { NetworkModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { Connectivity } from '../../../../connectivity/connectivity.type';
import { useStudyContext } from '../../../../../../hooks/use-study-context';

export type LccCreationSchemaForm = {
    [EQUIPMENT_ID]: string;
    [EQUIPMENT_NAME]?: string;
    [HVDC_LINE_TAB]: {
        [NOMINAL_V]: number;
        [R]: number;
        [MAX_P]: number;
        [CONVERTERS_MODE]: string;
        [ACTIVE_POWER_SETPOINT]: number;
        [ADDITIONAL_PROPERTIES]?: Property[];
    };
    [CONVERTER_STATION_1]: {
        [CONVERTER_STATION_ID]: string;
        [CONVERTER_STATION_NAME]?: string;
        [LOSS_FACTOR]: number;
        [POWER_FACTOR]: number;
        [CONNECTIVITY]: Connectivity;
        [FILTERS_SHUNT_COMPENSATOR_TABLE]?: ShuntCompensatorFormSchema[];
    };
    [CONVERTER_STATION_2]: {
        [CONVERTER_STATION_ID]: string;
        [CONVERTER_STATION_NAME]?: string;
        [LOSS_FACTOR]: number;
        [POWER_FACTOR]: number;
        [CONNECTIVITY]: Connectivity;
        [FILTERS_SHUNT_COMPENSATOR_TABLE]?: ShuntCompensatorFormSchema[];
    };
};

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [HVDC_LINE_TAB]: getLccHvdcLineEmptyFormData(),
    [CONVERTER_STATION_1]: getLccConverterStationEmptyFormData(),
    [CONVERTER_STATION_2]: getLccConverterStationEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [HVDC_LINE_TAB]: getLccHvdcLineSchema(),
        [CONVERTER_STATION_1]: getLccConverterStationSchema(),
        [CONVERTER_STATION_2]: getLccConverterStationSchema(),
    })
    .required();

export type LccCreationDialogProps = NetworkModificationDialogProps & {
    editData: LccCreationInfos;
};

export function LccCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LccCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const studyContext = useStudyContext();
    const formMethods = useForm<DeepNullable<LccCreationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LccCreationSchemaForm>>(formSchema),
    });
    const { reset } = formMethods;
    const [tabIndex, setTabIndex] = useState<number>(LccDialogTab.HVDC_LINE_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const fromSearchCopyToFormValues = (lccHvdcLine: LccFormInfos) => ({
        [EQUIPMENT_ID]: lccHvdcLine.id + '(1)',
        [EQUIPMENT_NAME]: lccHvdcLine.name ?? '',
        [HVDC_LINE_TAB]: getLccHvdcLineFromSearchCopy(lccHvdcLine),
        [CONVERTER_STATION_1]: getLccConverterStationFromSearchCopy(lccHvdcLine.lccConverterStation1),
        [CONVERTER_STATION_2]: getLccConverterStationFromSearchCopy(lccHvdcLine.lccConverterStation2),
    });

    const fromEditDataToFormValues = useCallback(
        (lccCreationInfos: LccCreationInfos) => {
            reset({
                [EQUIPMENT_ID]: lccCreationInfos.equipmentId,
                [EQUIPMENT_NAME]: lccCreationInfos.equipmentName ?? '',
                [HVDC_LINE_TAB]: getLccHvdcLineFromEditData(lccCreationInfos),
                [CONVERTER_STATION_1]: getLccConverterStationFromEditData(lccCreationInfos.converterStation1),
                [CONVERTER_STATION_2]: getLccConverterStationFromEditData(lccCreationInfos.converterStation2),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy(
        (data) => {
            reset(fromSearchCopyToFormValues(data), { keepDefaultValues: true });
        },
        ExtendedEquipmentType.HVDC_LINE_LCC,
        studyContext
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (lccHvdcLine: LccCreationSchemaForm) => {
            const hvdcLineTab = lccHvdcLine[HVDC_LINE_TAB];
            const lccConverterStation1 = getLccConverterStationCreationData(lccHvdcLine[CONVERTER_STATION_1]);
            const lccConverterStation2 = getLccConverterStationCreationData(lccHvdcLine[CONVERTER_STATION_2]);
            createLcc({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                id: lccHvdcLine[EQUIPMENT_ID],
                name: sanitizeString(lccHvdcLine[EQUIPMENT_NAME]),
                nominalV: hvdcLineTab[NOMINAL_V],
                r: hvdcLineTab[R],
                maxP: hvdcLineTab[MAX_P],
                convertersMode: hvdcLineTab[CONVERTERS_MODE],
                activePowerSetpoint: hvdcLineTab[ACTIVE_POWER_SETPOINT],
                converterStation1: lccConverterStation1,
                converterStation2: lccConverterStation2,
                properties: toModificationProperties(hvdcLineTab),
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LccCreationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const onValidationError = useCallback(
        (errors: any) => {
            const tabsInError = [];
            if (errors?.[HVDC_LINE_TAB]) {
                tabsInError.push(LccDialogTab.HVDC_LINE_TAB);
            }
            if (errors?.[CONVERTER_STATION_1]) {
                tabsInError.push(LccDialogTab.CONVERTER_STATION_1);
            }
            if (errors?.[CONVERTER_STATION_2]) {
                tabsInError.push(LccDialogTab.CONVERTER_STATION_2);
            }

            if (tabsInError.includes(tabIndex)) {
                // error in current tab => do not change tab systematically but remove current tab in error list
                setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
            } else if (tabsInError.length > 0) {
                // switch to the first tab in the list then remove the tab in the error list
                setTabIndex(tabsInError[0]);
                setTabIndexesWithError(tabsInError.filter((errorTabIndex, index, arr) => errorTabIndex !== arr[0]));
            }
        },
        [tabIndex]
    );

    const clear = useCallback(() => reset(emptyFormData), [reset]);
    const headerAndTabs = (
        <Grid container spacing={2}>
            <LccCreationDialogHeader />
            <LccTabs tabIndex={tabIndex} tabIndexesWithError={tabIndexesWithError} setTabIndex={setTabIndex} />
        </Grid>
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="CreateLcc"
                subtitle={headerAndTabs}
                searchCopy={searchCopy}
                onValidationError={onValidationError}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                PaperProps={{
                    sx: {
                        height: '95vh',
                    },
                }}
                {...dialogProps}
            >
                <LccCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    tabIndex={tabIndex}
                />
                {studyContext && (
                    <EquipmentSearchDialog
                        open={searchCopy.isDialogSearchOpen}
                        onClose={searchCopy.handleCloseSearchDialog}
                        onSelectionChange={searchCopy.handleSelectionChange}
                        equipmentType={ExtendedEquipmentType.HVDC_LINE_LCC}
                        studyContext={studyContext}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
