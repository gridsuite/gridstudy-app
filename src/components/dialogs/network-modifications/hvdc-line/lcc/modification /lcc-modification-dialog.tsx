import {
    ACTIVE_POWER_SETPOINT,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    MAX_P,
    NOMINAL_V,
    R,
} from '../../../../../utils/field-constants';
import yup from '../../../../../utils/yup-config';
import { CustomFormProvider, ExtendedEquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LccModificationForm } from './lcc-modification-form';
import { LccCreationDialogTab, LccInfos } from '../lcc-type';
import { useCallback, useEffect, useState } from 'react';
import LccCreationDialogHeader from '../creation/lcc-creation-dialog-header';
import LccTabs from '../lcc-tabs';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { FetchStatus } from 'services/utils.type';
import { ModificationDialog } from '../../../../commons/modificationDialog';
import {
    getLccConverterStationFromEditData,
    getLccConverterStationModificationData,
    getLccConverterStationModificationEmptyFormData,
    getLccConverterStationModificationSchema,
    getLccHvdcLineEmptyFormData,
    getLccHvdcLineFromEditData,
    getLccHvdcLineModificationSchema,
} from '../lcc-utils';
import { modifyLcc } from 'services/study/network-modifications';
import { sanitizeString } from 'components/dialogs/dialog-utils';
import { toModificationProperties } from '../../../common/properties/property-utils';
import { EquipmentModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from '../../../../../graph/util/model-functions';
import { EquipmentIdSelector } from '../../../../equipment-id/equipment-id-selector';
import Grid from '@mui/material/Grid';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [HVDC_LINE_TAB]: getLccHvdcLineEmptyFormData(),
    [CONVERTER_STATION_1]: getLccConverterStationModificationEmptyFormData(),
    [CONVERTER_STATION_2]: getLccConverterStationModificationEmptyFormData(),
};

export type LccModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: LccInfos;
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string(), //TODO : remove
        [EQUIPMENT_NAME]: yup.string(),
        [HVDC_LINE_TAB]: getLccHvdcLineModificationSchema(),
        [CONVERTER_STATION_1]: getLccConverterStationModificationSchema(),
        [CONVERTER_STATION_2]: getLccConverterStationModificationSchema(),
    })
    .required();

export const LccModificationDialog = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    onClose,
    defaultIdValue,
    ...dialogProps
}: Readonly<LccModificationDialogProps>) => {
    const currentNodeUuid = currentNode?.id;
    const [tabIndex, setTabIndex] = useState<number>(LccCreationDialogTab.HVDC_LINE_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string | null>(defaultIdValue ?? null);

    const formMethods = useForm<any>({
        defaultValues: emptyFormData,
        resolver: yupResolver<any>(formSchema),
    });

    const { reset } = useForm();

    const onSubmit = useCallback(
        (lccHvdcLine: any) => {
            const hvdcLineTab = lccHvdcLine[HVDC_LINE_TAB];
            const converterStation1 = getLccConverterStationModificationData(lccHvdcLine[CONVERTER_STATION_1]);
            const converterStation2 = getLccConverterStationModificationData(lccHvdcLine[CONVERTER_STATION_2]);
            modifyLcc({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                id: lccHvdcLine[EQUIPMENT_ID] ?? '',
                name: sanitizeString(lccHvdcLine[EQUIPMENT_NAME]),
                nominalV: hvdcLineTab[NOMINAL_V],
                r: hvdcLineTab[R],
                maxP: hvdcLineTab[MAX_P],
                convertersMode: hvdcLineTab[CONVERTERS_MODE],
                activePowerSetpoint: hvdcLineTab[ACTIVE_POWER_SETPOINT],
                converterStation1: converterStation1,
                converterStation2: converterStation2,
                properties: toModificationProperties(hvdcLineTab),
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
            }).catch((error: any) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LccModificationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const headerAndTabs = (
        <Grid container spacing={2}>
            <LccCreationDialogHeader />
            <LccTabs tabIndex={tabIndex} tabIndexesWithError={tabIndexesWithError} setTabIndex={setTabIndex} />
        </Grid>
    );

    const fromEditDataToFormValues = useCallback(
        (lccModificationInfos: LccInfos) => {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }

            reset({
                [EQUIPMENT_ID]: lccModificationInfos.equipmentId,
                [EQUIPMENT_NAME]: lccModificationInfos.equipmentName ?? '',
                [HVDC_LINE_TAB]: getLccHvdcLineFromEditData(lccModificationInfos),
                [CONVERTER_STATION_1]: getLccConverterStationFromEditData(lccModificationInfos.converterStation1),
                [CONVERTER_STATION_2]: getLccConverterStationFromEditData(lccModificationInfos.converterStation2),
            });
        },
        [editData, reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

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
                tabsInError.push(LccCreationDialogTab.CONVERTER_STATION_2);
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

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        console.log('---------Clear');
        reset(emptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                maxWidth="md"
                titleId="ModifyLcc"
                onClear={clear}
                onSave={onSubmit}
                subtitle={headerAndTabs}
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
                {selectedId === null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={ExtendedEquipmentType.HVDC_LINE_LCC}
                        fillerHeight={17}
                    />
                )}
                {selectedId !== null && (
                    <LccModificationForm
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        tabIndex={tabIndex}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};
