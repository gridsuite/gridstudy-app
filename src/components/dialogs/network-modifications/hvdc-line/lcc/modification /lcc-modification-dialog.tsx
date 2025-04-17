/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FILTERS_SHUNT_COMPENSATOR_TABLE,
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
import { LccDialogTab, LccFormInfos, LccInfos } from '../common/lcc-type';
import { useCallback, useEffect, useState } from 'react';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
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
    getShuntCompensatorOnSideFormData,
} from '../common/lcc-utils';
import { modifyLcc } from 'services/study/network-modifications';
import { sanitizeString } from 'components/dialogs/dialog-utils';
import { getConcatenatedProperties, toModificationProperties } from '../../../common/properties/property-utils';
import { EquipmentModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from '../../../../../graph/util/model-functions';
import { EquipmentIdSelector } from '../../../../equipment-id/equipment-id-selector';
import { fetchNetworkElementInfos } from '../../../../../../services/study/network';
import { EQUIPMENT_INFOS_TYPES } from '../../../../../utils/equipment-types';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';

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
    defaultIdValue,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LccModificationDialogProps>) => {
    const [tabIndex, setTabIndex] = useState<number>(LccDialogTab.HVDC_LINE_TAB);
    const [lccToModify, setLccToModify] = useState<LccFormInfos | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [equipmentId, setEquipmentId] = useState<string | null>(defaultIdValue ?? null);

    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<any>({
        defaultValues: emptyFormData,
        resolver: yupResolver<any>(formSchema),
    });
    const { reset, handleSubmit, getValues } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const fromEditDataToFormValues = useCallback(
        (lccModificationInfos: LccInfos) => {
            if (editData?.equipmentId) {
                setEquipmentId(editData.equipmentId);
            }

            reset({
                [EQUIPMENT_ID]: lccModificationInfos.equipmentId,
                [EQUIPMENT_NAME]: lccModificationInfos.equipmentName,
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

    const onSubmit = useCallback(
        (lccHvdcLine: any) => {
            const hvdcLineTab = lccHvdcLine[HVDC_LINE_TAB];
            console.log('--------lccToModify : ', lccToModify);
            if (!lccToModify) {
                //TODO gérer l'erreur
                console.log('error');
                return;
            }
            const converterStation1 = getLccConverterStationModificationData(
                lccHvdcLine[CONVERTER_STATION_1],
                lccToModify.lccConverterStation1
            );
            const converterStation2 = getLccConverterStationModificationData(
                lccHvdcLine[CONVERTER_STATION_2],
                lccToModify.lccConverterStation2
            );
            modifyLcc({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                id: lccToModify.id,
                name: sanitizeString(lccHvdcLine[EQUIPMENT_NAME]),
                nominalV: hvdcLineTab[NOMINAL_V],
                r: hvdcLineTab[R],
                maxP: hvdcLineTab[MAX_P],
                convertersMode: hvdcLineTab[CONVERTERS_MODE],
                activePowerSetpoint: hvdcLineTab[ACTIVE_POWER_SETPOINT],
                lccConverterStation1: converterStation1,
                lccConverterStation2: converterStation2,
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
        [editData, studyUuid, currentNodeUuid, snackError, lccToModify]
    );

    const clear = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset({ ...emptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
        },
        [reset]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string | null) => {
            if (!equipmentId) {
                clear();
                console.log('set to null because equipmentId is null-----');
                setLccToModify(null);
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    ExtendedEquipmentType.HVDC_LINE_LCC,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value: LccFormInfos | null) => {
                        if (value) {
                            console.log('setting lccToModify to non null : ', value);
                            setLccToModify({ ...value });
                            reset((formValues: any) => ({
                                ...formValues,
                                [HVDC_LINE_TAB]: {
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues, HVDC_LINE_TAB),
                                },
                                [CONVERTER_STATION_1]: {
                                    ...formValues,
                                    [FILTERS_SHUNT_COMPENSATOR_TABLE]: getShuntCompensatorOnSideFormData(
                                        value.lccConverterStation1.shuntCompensatorsOnSide
                                    ),
                                },
                                [CONVERTER_STATION_2]: {
                                    ...formValues,
                                    [FILTERS_SHUNT_COMPENSATOR_TABLE]: getShuntCompensatorOnSideFormData(
                                        value.lccConverterStation2.shuntCompensatorsOnSide
                                    ),
                                },
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            console.log('set to null because of fetch failed------');
                            setLccToModify(null);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [clear, currentNode.id, currentRootNetworkUuid, editData?.equipmentId, getValues, reset, studyUuid]
    );

    useEffect(() => {
        if (equipmentId) {
            onEquipmentIdChange(equipmentId);
        }
    }, [equipmentId, onEquipmentIdChange]);

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                // @ts-ignore
                onSave={handleSubmit(onSubmit)}
                maxWidth={'md'}
                titleId="ModifyLcc"
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={equipmentId != null}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {equipmentId === null && (
                    <EquipmentIdSelector
                        defaultValue={equipmentId}
                        setSelectedId={setEquipmentId}
                        equipmentType={ExtendedEquipmentType.HVDC_LINE_LCC}
                        fillerHeight={17}
                    />
                )}
                {equipmentId !== null && (
                    <LccModificationForm
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        tabIndex={tabIndex}
                        setTabIndex={setTabIndex}
                        tabIndexesWithError={[]}
                        lccToModify={lccToModify}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};
