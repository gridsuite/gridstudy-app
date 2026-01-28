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
import {
    CustomFormProvider,
    EquipmentInfosTypes,
    ExtendedEquipmentType,
    fetchNetworkElementInfos,
    FetchStatus,
    MODIFICATION_TYPES,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { LccDialogTab, LccFormInfos, LccModificationSchemaForm } from '../common/lcc-type';
import { useCallback, useEffect, useState } from 'react';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import {
    getConcatenatedShuntCompensatorOnSideInfos,
    getLccConverterStationModificationData,
    getLccConverterStationModificationEmptyFormData,
    getLccConverterStationModificationFromEditData,
    getLccConverterStationModificationSchema,
    getLccHvdcLineEmptyFormData,
    getLccHvdcLineFromModificationEditData,
    getLccHvdcLineModificationSchema,
} from '../common/lcc-utils';
import { modifyLcc } from 'services/study/network-modifications';
import { sanitizeString } from 'components/dialogs/dialog-utils';
import { getConcatenatedProperties, toModificationProperties } from '../../../common/properties/property-utils';
import { EquipmentModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from '../../../../../graph/util/model-functions';
import { EquipmentIdSelector } from '../../../../equipment-id/equipment-id-selector';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { ModificationDialog } from '../../../../commons/modificationDialog';
import { LccModificationForm } from './lcc-modification-form';
import { toModificationOperation } from '../../../../../utils/utils';
import { LccConverterStationModificationInfos, LccModificationInfos } from 'services/network-modification-types';
import { DeepNullable } from '../../../../../utils/ts-utils';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { UUID } from 'node:crypto';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [HVDC_LINE_TAB]: getLccHvdcLineEmptyFormData(),
    [CONVERTER_STATION_1]: getLccConverterStationModificationEmptyFormData(),
    [CONVERTER_STATION_2]: getLccConverterStationModificationEmptyFormData(),
};

export type LccModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: LccModificationInfos;
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
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

    const formMethods = useFormWithDirtyTracking<DeepNullable<LccModificationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LccModificationSchemaForm>>(formSchema),
    });
    const { reset, getValues } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const fromEditDataToFormValues = useCallback(
        (lccModificationInfos: LccModificationInfos) => {
            if (editData?.equipmentId) {
                setEquipmentId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: lccModificationInfos.equipmentName?.value ?? '',
                [HVDC_LINE_TAB]: getLccHvdcLineFromModificationEditData(lccModificationInfos),
                [CONVERTER_STATION_1]: getLccConverterStationModificationFromEditData(
                    lccModificationInfos.converterStation1
                ),
                [CONVERTER_STATION_2]: getLccConverterStationModificationFromEditData(
                    lccModificationInfos.converterStation2
                ),
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
        (lccHvdcLine: LccModificationSchemaForm) => {
            const hvdcLineTab = lccHvdcLine[HVDC_LINE_TAB];
            if (!lccToModify) {
                return;
            }
            const converterStation1: LccConverterStationModificationInfos = getLccConverterStationModificationData(
                lccHvdcLine[CONVERTER_STATION_1],
                lccToModify.lccConverterStation1
            );
            const converterStation2 = getLccConverterStationModificationData(
                lccHvdcLine[CONVERTER_STATION_2],
                lccToModify.lccConverterStation2
            );

            const lccModificationInfos = {
                type: MODIFICATION_TYPES.LCC_MODIFICATION.type,
                uuid: editData?.uuid ?? null,
                equipmentId: lccToModify.id,
                equipmentName: toModificationOperation(sanitizeString(lccHvdcLine[EQUIPMENT_NAME])),
                nominalV: toModificationOperation(hvdcLineTab[NOMINAL_V]),
                r: toModificationOperation(hvdcLineTab[R]),
                maxP: toModificationOperation(hvdcLineTab[MAX_P]),
                convertersMode: toModificationOperation(hvdcLineTab[CONVERTERS_MODE]),
                activePowerSetpoint: toModificationOperation(hvdcLineTab[ACTIVE_POWER_SETPOINT]),
                converterStation1: converterStation1,
                converterStation2: converterStation2,
                properties: toModificationProperties(hvdcLineTab),
            } satisfies LccModificationInfos;

            modifyLcc({
                lccModificationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData ? editData.uuid : null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LccModificationError' });
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
                setLccToModify(null);
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    ExtendedEquipmentType.HVDC_LINE_LCC,
                    EquipmentInfosTypes.FORM.type,
                    equipmentId as UUID,
                    true
                )
                    .then((value: LccFormInfos | null) => {
                        if (value) {
                            setLccToModify({ ...value });
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [HVDC_LINE_TAB]: {
                                        ...formValues,
                                        [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                            value,
                                            getValues,
                                            HVDC_LINE_TAB
                                        ),
                                    },
                                    [CONVERTER_STATION_1]: {
                                        ...formValues,
                                        [FILTERS_SHUNT_COMPENSATOR_TABLE]: getConcatenatedShuntCompensatorOnSideInfos(
                                            editData?.converterStation1.shuntCompensatorsOnSide,
                                            value.lccConverterStation1.shuntCompensatorsOnSide
                                        ),
                                    },
                                    [CONVERTER_STATION_2]: {
                                        ...formValues,
                                        [FILTERS_SHUNT_COMPENSATOR_TABLE]: getConcatenatedShuntCompensatorOnSideInfos(
                                            editData?.converterStation2.shuntCompensatorsOnSide,
                                            value.lccConverterStation2.shuntCompensatorsOnSide
                                        ),
                                    },
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setLccToModify(null);
                        }
                    });
            }
        },
        [clear, currentNode.id, currentRootNetworkUuid, editData, getValues, reset, studyUuid]
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
                onSave={onSubmit}
                titleId="ModifyLcc"
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                        maxWidth: '75%',
                    },
                }}
                open={open}
                keepMounted={true}
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
