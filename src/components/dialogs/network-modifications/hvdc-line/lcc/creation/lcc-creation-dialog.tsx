/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    CONVERTERS_MODE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    LOSS_FACTOR,
    MAX_P,
    NOMINAL_V,
    POWER_FACTOR,
    R,
} from '../../../../../utils/field-constants';
import yup from '../../../../../utils/yup-config';
import { DialogProps } from '@mui/material/Dialog/Dialog';
import { CurrentTreeNode } from '../../../../../../redux/reducer';
import { UUID } from 'crypto';
import { FetchStatus } from '../../../../../../services/utils.type';
import { useForm } from 'react-hook-form';
import { DeepNullable } from '../../../../../utils/ts-utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { LccCreationDialogTab, LccCreationInfos, LccFormInfos } from './lcc-creation.type';
import { getLccHvdcLineEmptyFormData, getLccHvdcLineSchema } from './lcc-hvdc-line';
import { getLccConverterStationEmptyFormData, getLccConverterStationSchema } from './converter-station';
import { Property } from '../../../common/properties/property-utils';
import { useFormSearchCopy } from '../../../../form-search-copy-hook';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import { CustomFormProvider, EquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import ModificationDialog from '../../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../../equipment-search-dialog';
import { useCallback, useState } from 'react';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { createLcc } from '../../../../../../services/study/network-modifications';
import { sanitizeString } from '../../../../dialog-utils';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import { Grid } from '@mui/material';
import LccCreationDialogHeader from './lcc-creation-dialog-header';
import LccCreationDialogTabs from './lcc-creation-dialog-tabs';
import LccCreationForm from './lcc-creation-form';

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
    };
    [CONVERTER_STATION_2]: {
        [CONVERTER_STATION_ID]: string;
        [CONVERTER_STATION_NAME]?: string;
        [LOSS_FACTOR]: number;
        [POWER_FACTOR]: number;
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
        [EQUIPMENT_NAME]: yup.string(),
        [HVDC_LINE_TAB]: getLccHvdcLineSchema(),
        [CONVERTER_STATION_1]: getLccConverterStationSchema(),
        [CONVERTER_STATION_2]: getLccConverterStationSchema(),
    })
    .required();

export interface LccCreationDialogProps extends Partial<DialogProps> {
    editData: LccCreationInfos;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
}

export function LccCreationDialog({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LccCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const formMethods = useForm<DeepNullable<LccCreationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LccCreationSchemaForm>>(formSchema),
    });
    const { reset } = formMethods;
    const [tabIndex, setTabIndex] = useState(LccCreationDialogTab.HVDC_LINE_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const fromSearchCopyToFormValues = (lccHvdcLine: LccFormInfos) => ({
        [EQUIPMENT_ID]: lccHvdcLine.id + '(1)',
        [EQUIPMENT_NAME]: lccHvdcLine.name ?? '',
    });

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: fromSearchCopyToFormValues,
        setFormValues: (data: LccCreationSchemaForm) => {
            reset(data, { keepDefaultValues: true });
        },
        elementType: EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
        operation: undefined,
    });

    const onSubmit = useCallback(
        (lccHvdcLine: LccCreationSchemaForm) => {
            createLcc({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                id: lccHvdcLine[EQUIPMENT_ID],
                name: sanitizeString(lccHvdcLine[EQUIPMENT_NAME]),
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadCreationError',
                });
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
                tabsInError.push(LccCreationDialogTab.HVDC_LINE_TAB);
            }
            if (errors?.[CONVERTER_STATION_1]) {
                tabsInError.push(LccCreationDialogTab.CONVERTER_STATION_1);
            }
            if (errors?.[CONVERTER_STATION_2]) {
                tabsInError.push(LccCreationDialogTab.CONVERTER_STATION_1);
            }

            if (tabsInError.includes(tabIndex)) {
                setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
            } else if (tabsInError.length > 0) {
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
            <LccCreationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
            />
        </Grid>
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                onClose={clear}
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-lcc"
                titleId="CreateLcc"
                subtitle={headerAndTabs}
                searchCopy={searchCopy}
                onValidationError={onValidationError}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                PaperProps={{
                    sx: {
                        height: '75vh',
                    },
                }}
                {...dialogProps}
            >
                <LccCreationForm studyUuid={studyUuid} currentNode={currentNode} tabIndex={tabIndex} />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    equipmentType={EquipmentType.LCC_CONVERTER_STATION}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
