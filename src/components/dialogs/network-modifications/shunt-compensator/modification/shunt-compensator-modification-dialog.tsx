/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    getConcatenatedProperties,
    ShuntCompensatorFormInfos,
    ShuntCompensatorModificationDto,
    shuntCompensatorModificationDtoToForm,
    shuntCompensatorModificationEmptyFormData,
    ShuntCompensatorModificationForm,
    ShuntCompensatorModificationFormData,
    shuntCompensatorModificationFormSchema,
    shuntCompensatorModificationFormToDto,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { EQUIPMENT_INFOS_TYPES } from '../../../../utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyShuntCompensator } from '../../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

export type ShuntCompensatorModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: ShuntCompensatorModificationDto;
};
export default function ShuntCompensatorModificationDialog({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<ShuntCompensatorModificationDialogProps>) {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [selectedId, setSelectedId] = useState<string | null>(defaultIdValue ?? null);
    const [shuntCompensatorInfos, setShuntCompensatorInfos] = useState<ShuntCompensatorFormInfos | null>(null);

    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

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

    const formMethods = useFormWithDirtyTracking<DeepNullable<ShuntCompensatorModificationFormData>>({
        defaultValues: shuntCompensatorModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<ShuntCompensatorModificationFormData>>(
            shuntCompensatorModificationFormSchema
        ),
    });

    const {
        reset,
        formState: { dirtyFields },
        getValues,
    } = formMethods;

    // If we only change the characteristics choice without changing the corresponding fields,
    // we keep the validate button disable: if we choose "susceptance", we have to add a value for
    // "susceptance per section", and if we choose "Q at nominal voltage", we have to add a value for
    // "shunt compensator type" or for "Q at nominal voltage" numeric field
    const disableSave =
        (Object.keys(dirtyFields).length === 1 && dirtyFields[FieldConstants.CHARACTERISTICS_CHOICE]) ||
        Object.keys(dirtyFields).length === 0;

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset(shuntCompensatorModificationDtoToForm(editData));
        }
    }, [reset, editData]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
                    EquipmentType.SHUNT_COMPENSATOR,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((shuntCompensator: ShuntCompensatorFormInfos) => {
                        if (shuntCompensator) {
                            if (shuntCompensator.isLinear) {
                                setShuntCompensatorInfos(shuntCompensator);
                                setDataFetchStatus(FetchStatus.SUCCEED);
                                reset(
                                    (formValues) => ({
                                        ...formValues,
                                        [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                        [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                            shuntCompensator,
                                            getValues
                                        ),
                                    }),
                                    { keepDirty: true }
                                );
                            } else {
                                snackError({
                                    headerId: 'ShuntCompensatorNonlinearError',
                                });
                            }
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setShuntCompensatorInfos(null);
                        }
                    });
            } else {
                setShuntCompensatorInfos(null);
            }
        },
        [currentNode?.id, currentRootNetworkUuid, snackError, studyUuid, reset, getValues, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const clear = useCallback(() => {
        reset(shuntCompensatorModificationEmptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (shuntCompensator: ShuntCompensatorModificationFormData) => {
            const dto = shuntCompensatorModificationFormToDto(shuntCompensator);
            modifyShuntCompensator({
                shuntCompensatorModificationDto: dto,
                studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'ShuntCompensatorModificationError' });
            });
        },
        [currentNodeUuid, studyUuid, editData, snackError]
    );

    return (
        <CustomFormProvider
            validationSchema={shuntCompensatorModificationFormSchema}
            {...formMethods}
            removeOptional
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="ModifyShuntCompensator"
                open={open}
                disabledSave={disableSave}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId === null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.SHUNT_COMPENSATOR}
                        fillerHeight={5}
                    />
                )}
                {selectedId !== null && (
                    <ShuntCompensatorModificationForm
                        shuntCompensatorToModify={shuntCompensatorInfos}
                        voltageLevelOptions={voltageLevelOptions}
                        PositionDiagramPane={PositionDiagramPane}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
