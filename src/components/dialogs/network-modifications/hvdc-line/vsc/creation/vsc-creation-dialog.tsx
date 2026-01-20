/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    CustomFormProvider,
    ExtendedEquipmentType,
    MODIFICATION_TYPES,
    snackWithFallback,
    TextInput,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { FieldErrors, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER_SETPOINT,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    MAX_P,
    NOMINAL_V,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P0,
    R,
} from '../../../../../utils/field-constants';
import { Box, Grid } from '@mui/material';
import { filledTextField, sanitizeString } from '../../../../dialog-utils';
import VscTabs from '../vsc-tabs';
import yup from 'components/utils/yup-config';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { ModificationDialog } from '../../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import { FetchStatus } from '../../../../../../services/utils';
import VscCreationForm from './vsc-creation-form';
import { createVsc } from '../../../../../../services/study/network-modifications';
import { useFormSearchCopy } from '../../../../commons/use-form-search-copy';
import EquipmentSearchDialog from '../../../../equipment-search-dialog';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../../common/properties/property-utils';
import GridItem from '../../../../commons/grid-item';
import { VSC_CREATION_TABS } from '../vsc-utils';
import { NetworkModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { VscCreationInfos } from '../../../../../../services/network-modification-types';
import { DeepNullable } from '../../../../../utils/ts-utils';
import { VscCreationDialogSchemaForm, VscFormInfos } from '../vsc-dialog.type';
import {
    getVscHvdcLinePaneEmptyFormData,
    getVscHvdcLinePaneSchema,
    getVscHvdcLineTabFormData,
    getVscHvdcLineTabFormEditData,
} from '../hvdc-line-pane/vsc-hvdc-line-pane-utils';
import {
    getConverterStationCreationData,
    getConverterStationFormEditData,
    getConverterStationFromSearchCopy,
    getVscConverterStationEmptyFormData,
    getVscConverterStationSchema,
} from '../converter-station/converter-station-utils';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [HVDC_LINE_TAB]: getVscHvdcLinePaneSchema(),
        [CONVERTER_STATION_1]: getVscConverterStationSchema(),
        [CONVERTER_STATION_2]: getVscConverterStationSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();
const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [HVDC_LINE_TAB]: getVscHvdcLinePaneEmptyFormData(false),
    [CONVERTER_STATION_1]: getVscConverterStationEmptyFormData(false),
    [CONVERTER_STATION_2]: getVscConverterStationEmptyFormData(false),
    ...emptyProperties,
};

export type VscCreationDialogProps = NetworkModificationDialogProps & {
    editData: VscCreationInfos;
};

export default function VscCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<VscCreationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState(VSC_CREATION_TABS.HVDC_LINE_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);

    const formMethods = useForm<DeepNullable<VscCreationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<VscCreationDialogSchemaForm>>(formSchema),
    });

    const fromSearchCopyToFormValues = (hvdcLine: VscFormInfos) => {
        reset(
            {
                [EQUIPMENT_ID]: hvdcLine.id + '(1)',
                [EQUIPMENT_NAME]: hvdcLine.name ?? '',
                [HVDC_LINE_TAB]: getVscHvdcLineTabFormData(hvdcLine),
                [CONVERTER_STATION_1]: getConverterStationFromSearchCopy(hvdcLine.converterStation1),
                [CONVERTER_STATION_2]: getConverterStationFromSearchCopy(hvdcLine.converterStation2),
                ...copyEquipmentPropertiesForCreation(hvdcLine),
            },
            { keepDefaultValues: true }
        );
    };

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, ExtendedEquipmentType.HVDC_LINE_VSC);

    const generatorIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const generatorNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;

    const headersAndTabs = (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container spacing={2}>
                <GridItem size={4}>{generatorIdField}</GridItem>
                <GridItem size={4}>{generatorNameField}</GridItem>
            </Grid>
            <VscTabs tabIndex={tabIndex} tabIndexesWithError={tabIndexesWithError} setTabIndex={setTabIndex} />
        </Box>
    );

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData?.equipmentName ?? '',
                ...getVscHvdcLineTabFormEditData(HVDC_LINE_TAB, editData),
                ...getConverterStationFormEditData(CONVERTER_STATION_1, editData.converterStation1),
                ...getConverterStationFormEditData(CONVERTER_STATION_2, editData.converterStation2),
                ...getPropertiesFromModification(editData.properties),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onValidationError = (errors: FieldErrors) => {
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
        (hvdcLine: VscCreationDialogSchemaForm) => {
            const hvdcLineTab = hvdcLine[HVDC_LINE_TAB];
            const vscCreationInfos = {
                type: MODIFICATION_TYPES.VSC_CREATION.type,
                equipmentId: hvdcLine[EQUIPMENT_ID],
                equipmentName: sanitizeString(hvdcLine[EQUIPMENT_NAME]) ?? null,
                nominalV: hvdcLineTab[NOMINAL_V],
                r: hvdcLineTab[R],
                maxP: hvdcLineTab[MAX_P],
                operatorActivePowerLimitFromSide1ToSide2: hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE1],
                operatorActivePowerLimitFromSide2ToSide1: hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE2],
                convertersMode: hvdcLineTab[CONVERTERS_MODE],
                activePowerSetpoint: hvdcLineTab[ACTIVE_POWER_SETPOINT],
                angleDroopActivePowerControl: hvdcLineTab[ANGLE_DROOP_ACTIVE_POWER_CONTROL] ?? null,
                p0: hvdcLineTab[P0] ?? null,
                droop: hvdcLineTab[DROOP] ?? null,
                converterStation1: getConverterStationCreationData(hvdcLine[CONVERTER_STATION_1]),
                converterStation2: getConverterStationCreationData(hvdcLine[CONVERTER_STATION_2]),
                properties: toModificationProperties(hvdcLine),
            } satisfies VscCreationInfos;
            createVsc({
                vscCreationInfos: vscCreationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'VscCreationError' });
            });
        },
        [studyUuid, currentNodeUuid, editData, snackError]
    );

    return (
        <CustomFormProvider {...formMethods} validationSchema={formSchema}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidationError={onValidationError}
                onSave={onSubmit}
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
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <VscCreationForm
                    tabIndex={tabIndex}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={ExtendedEquipmentType.HVDC_LINE_VSC}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
