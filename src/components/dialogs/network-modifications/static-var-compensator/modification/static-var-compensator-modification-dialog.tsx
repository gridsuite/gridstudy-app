/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    getConcatenatedProperties,
    snackWithFallback,
    STATIC_VAR_COMPENSATOR_TAB_FIELDS,
    StaticVarCompensatorDialogTab,
    StaticVarCompensatorFormInfo,
    StaticVarCompensatorModificationDto,
    staticVarCompensatorModificationDtoToForm,
    staticVarCompensatorModificationEmptyFormData,
    StaticVarCompensatorForm,
    StaticVarCompensatorModificationFormData,
    staticVarCompensatorModificationFormSchema,
    staticVarCompensatorModificationFormToDto,
    useSnackMessage,
    useTabs,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyStaticVarCompensator } from '../../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../services/study/network';
import { fetchVoltageLevelEquipments } from '../../../../../services/study/network-map';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { FetchStatus } from '../../../../../services/utils.type';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { WithModificationId } from 'services/network-modification-types';
import { FORM_LOADING_DELAY } from '../../../../network/constants';

interface StaticVarCompensatorModificationDtoWithId extends StaticVarCompensatorModificationDto, WithModificationId {}

export type StaticVarCompensatorModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: StaticVarCompensatorModificationDtoWithId;
};

export default function StaticVarCompensatorModificationDialog({
    editData,
    defaultIdValue,
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    isReadOnly = false,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<StaticVarCompensatorModificationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string | null>(defaultIdValue ?? null);
    const [staticVarCompensatorToModify, setStaticVarCompensatorToModify] =
        useState<StaticVarCompensatorFormInfo | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    const getVoltageLevelEquipments = useCallback(
        (voltageLevelId: string) =>
            fetchVoltageLevelEquipments(studyUuid, currentNodeUuid, currentRootNetworkUuid, voltageLevelId, true),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    const formMethods = useFormWithDirtyTracking<DeepNullable<StaticVarCompensatorModificationFormData>>({
        defaultValues: staticVarCompensatorModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<StaticVarCompensatorModificationFormData>>(
            staticVarCompensatorModificationFormSchema
        ),
    });

    const { reset, getValues } = formMethods;
    const { errors } = formMethods.formState;

    const useTabsReturn = useTabs<StaticVarCompensatorDialogTab>({
        defaultTab: StaticVarCompensatorDialogTab.CONNECTIVITY_TAB,
        errors,
        tabFields: STATIC_VAR_COMPENSATOR_TAB_FIELDS,
    });

    useEffect(() => {
        if (editData) {
            if (editData.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset(staticVarCompensatorModificationDtoToForm(editData));
        }
    }, [editData, reset]);

    //this method empties the form, and let us pass custom data that we want to set
    const setValuesAndEmptyOthers = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset(
                { ...staticVarCompensatorModificationEmptyFormData, ...customData },
                { keepDefaultValues: keepDefaultValues }
            );
        },
        [reset]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    EquipmentType.STATIC_VAR_COMPENSATOR,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value: StaticVarCompensatorFormInfo) => {
                        if (value) {
                            setStaticVarCompensatorToModify(value);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                            keepDirty: true,
                        });
                        if (editData?.equipmentId !== equipmentId) {
                            setStaticVarCompensatorToModify(null);
                        }
                    });
            } else {
                setValuesAndEmptyOthers();
                setStaticVarCompensatorToModify(null);
            }
        },
        [
            studyUuid,
            currentNode.id,
            currentRootNetworkUuid,
            reset,
            getValues,
            editData?.equipmentId,
            setValuesAndEmptyOthers,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (formData: StaticVarCompensatorModificationFormData) => {
            const dto = staticVarCompensatorModificationFormToDto(formData);
            modifyStaticVarCompensator(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: unknown) => {
                snackWithFallback(snackError, error, { headerId: 'StaticVarCompensatorModificationError' });
            });
        },
        [studyUuid, currentNodeUuid, editData?.uuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider
            isReadOnly={isReadOnly}
            validationSchema={staticVarCompensatorModificationFormSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={setValuesAndEmptyOthers}
                onSave={onSubmit}
                maxWidth={'md'}
                slotProps={{ paper: { sx: { height: '75vh' } } }}
                titleId="ModifyStaticVarCompensator"
                onValidationError={useTabsReturn.onError}
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.STATIC_VAR_COMPENSATOR}
                        fillerHeight={17}
                    />
                )}
                {selectedId != null && (
                    <StaticVarCompensatorForm
                        isModification
                        staticVarCompensatorToModify={staticVarCompensatorToModify}
                        voltageLevelOptions={voltageLevelOptions}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                        PositionDiagramPane={PositionDiagramPane}
                        fetchVoltageLevelEquipments={getVoltageLevelEquipments}
                        useTabsReturn={useTabsReturn}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
