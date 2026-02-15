/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    emptyProperties,
    EquipmentType,
    getConcatenatedProperties,
    getPropertiesFromModification,
    MODIFICATION_TYPES,
    modificationPropertiesSchema,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
    DeepNullable,
    sanitizeString,
    FieldConstants,
} from '@gridsuite/commons-ui';
import {
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_NAME,
    ID,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    VOLTAGE_LEVEL,
} from '../../../../utils/field-constants';
import yup from '../../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyShuntCompensator } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { ShuntCompensatorModificationInfos } from '../../../../../services/network-modification-types';
import { ShuntCompensatorModificationDialogSchemaForm } from '../shunt-compensator-dialog.type';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormValidationSchema,
} from '../characteristics-pane/characteristics-form-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { toModificationOperation } from '../../../../utils/utils';
import ShuntCompensatorModificationForm from './shunt-compensator-modification-form';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getConnectivityWithPositionEmptyFormData(true),
    ...getCharacteristicsEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(true),
        ...getCharacteristicsFormValidationSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

export type ShuntCompensatorModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: ShuntCompensatorModificationInfos;
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
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [isLinear, setIsLinear] = useState(false);
    const [shuntCompensatorInfos, setShuntCompensatorInfos] = useState(null);

    const formMethods = useFormWithDirtyTracking<DeepNullable<ShuntCompensatorModificationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<ShuntCompensatorModificationDialogSchemaForm>>(formSchema),
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
        (Object.keys(dirtyFields).length === 1 && dirtyFields[CHARACTERISTICS_CHOICE]) ||
        Object.keys(dirtyFields).length === 0;

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                ...getConnectivityFormData({
                    voltageLevelId: editData?.voltageLevelId?.value ?? null,
                    busbarSectionId: editData?.busOrBusbarSectionId?.value ?? null,
                    connectionName: editData?.connectionName?.value ?? '',
                    connectionDirection: editData?.connectionDirection?.value ?? null,
                    connectionPosition: editData?.connectionPosition?.value ?? null,
                    terminalConnected: editData?.terminalConnected?.value ?? null,
                    isEquipmentModification: true,
                }),
                ...getCharacteristicsFormData({
                    maxSusceptance: editData.maxSusceptance?.value ?? null,
                    maxQAtNominalV: editData.maxQAtNominalV?.value ?? null,
                    shuntCompensatorType: editData.shuntCompensatorType?.value ?? null,
                    sectionCount: editData.sectionCount?.value ?? null,
                    maximumSectionCount: editData.maximumSectionCount?.value ?? null,
                }),
                ...getPropertiesFromModification(editData.properties),
            });
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
                    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((shuntCompensator) => {
                        if (shuntCompensator) {
                            if (shuntCompensator.isLinear) {
                                setShuntCompensatorInfos(shuntCompensator);
                                setDataFetchStatus(FetchStatus.SUCCEED);
                                setIsLinear(true);
                                reset(
                                    (formValues) => ({
                                        ...formValues,
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
                                setIsLinear(false);
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
        [currentNode.id, currentRootNetworkUuid, snackError, studyUuid, reset, getValues, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (shuntCompensator: ShuntCompensatorModificationDialogSchemaForm) => {
            const shuntCompensatorModificationInfos = {
                type: MODIFICATION_TYPES.SHUNT_COMPENSATOR_MODIFICATION.type,
                uuid: editData?.uuid ?? null,
                equipmentId: selectedId,
                equipmentName: toModificationOperation(sanitizeString(shuntCompensator[EQUIPMENT_NAME])),
                maximumSectionCount: toModificationOperation(shuntCompensator[MAXIMUM_SECTION_COUNT]),
                sectionCount: toModificationOperation(shuntCompensator[SECTION_COUNT]),
                maxSusceptance: toModificationOperation(
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                        ? shuntCompensator[MAX_SUSCEPTANCE]
                        : null
                ),
                maxQAtNominalV: toModificationOperation(
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                        ? shuntCompensator[MAX_Q_AT_NOMINAL_V]
                        : null
                ),
                shuntCompensatorType: toModificationOperation(
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                        ? shuntCompensator[SHUNT_COMPENSATOR_TYPE]
                        : null
                ),
                voltageLevelId: toModificationOperation(shuntCompensator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID]),
                busOrBusbarSectionId: toModificationOperation(
                    shuntCompensator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID]
                ),
                connectionName: toModificationOperation(
                    sanitizeString(shuntCompensator[CONNECTIVITY]?.[CONNECTION_NAME])
                ),
                connectionDirection: toModificationOperation(shuntCompensator[CONNECTIVITY]?.[CONNECTION_DIRECTION]),
                connectionPosition: toModificationOperation(shuntCompensator[CONNECTIVITY]?.[CONNECTION_POSITION]),
                terminalConnected: toModificationOperation(shuntCompensator[CONNECTIVITY]?.[CONNECTED]),
                properties: toModificationProperties(shuntCompensator),
            } satisfies ShuntCompensatorModificationInfos;
            modifyShuntCompensator({
                shuntCompensatorModificationInfos: shuntCompensatorModificationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'ShuntCompensatorModificationError' });
            });
        },
        [currentNodeUuid, studyUuid, editData, snackError, selectedId]
    );

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            {...formMethods}
            removeOptional={true}
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
                {(selectedId === null || !isLinear) && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.SHUNT_COMPENSATOR}
                        fillerHeight={5}
                    />
                )}
                {selectedId !== null && isLinear && (
                    <ShuntCompensatorModificationForm
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        shuntCompensatorToModify={shuntCompensatorInfos}
                        equipmentId={selectedId}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
