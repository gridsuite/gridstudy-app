/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    EQUIPMENT_NAME,
    Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_TYPE,
    SUSCEPTANCE_PER_SECTION,
} from '../../../../utils/field-constants';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormValidationSchema,
} from '../characteristics-pane/characteristics-form-utils';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useEffect, useState } from 'react';
import {
    fetchNetworkElementInfos,
    FetchStatus,
    modifyShuntCompensator,
} from '../../../../../utils/rest-api';
import ModificationDialog from '../../../commons/modificationDialog';
import ShuntCompensatorModificationForm from './shunt-compensator-modification-form';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { sanitizeString } from '../../../dialogUtils';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../../../utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { isNodeBuilt } from '../../../../graph/util/model-functions';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getCharacteristicsEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        ...getCharacteristicsFormValidationSchema(true),
    })
    .required();

const ShuntCompensatorModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [shuntCompensatorInfos, setShuntCompensatorInfos] = useState(null);
    const [multiSections, setMultiSections] = useState(false);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        formState: { dirtyFields },
        control,
    } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_NAME]: shuntCompensator?.equipmentName?.value ?? '',
                ...getCharacteristicsFormData({
                    susceptancePerSection:
                        shuntCompensator.susceptancePerSection?.value,
                    qAtNominalV: shuntCompensator?.qAtNominalV?.value,
                    shuntCompensatorType:
                        shuntCompensator.shuntCompensatorType?.value,
                }),
            });
        },
        [reset]
    );

    const watchCharacteristicsChoice = useWatch({
        control,
        name: CHARACTERISTICS_CHOICE,
    });

    // If we only change the characteristics choice without changing the corresponding fields,
    // we keep the validate button disable: if we choose "susceptance", we have to add a value for
    // "susceptance per section", and if we choose "Q at nominal voltage", we have to add a value for
    // "shunt compensator type" or for "Q at nominal voltage" numeric field
    const disableSave =
        ((watchCharacteristicsChoice ===
            CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
            !(
                dirtyFields[Q_AT_NOMINAL_V] ||
                dirtyFields[SHUNT_COMPENSATOR_TYPE]
            )) ||
            (watchCharacteristicsChoice ===
                CHARACTERISTICS_CHOICES.SUSCEPTANCE.id &&
                !dirtyFields[SUSCEPTANCE_PER_SECTION])) &&
        !dirtyFields[EQUIPMENT_NAME];

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                setMultiSections(false);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((shuntCompensator) => {
                        if (shuntCompensator) {
                            if (
                                shuntCompensator.maximumSectionCount > 1 &&
                                isNodeBuilt(currentNode)
                            ) {
                                snackError({
                                    headerId:
                                        'ShuntCompensatorMultiSectionsError',
                                });
                                setShuntCompensatorInfos(null);
                                setDataFetchStatus(FetchStatus.FAILED);
                                setMultiSections(true);
                            } else {
                                setShuntCompensatorInfos(shuntCompensator);
                                setDataFetchStatus(FetchStatus.SUCCEED);
                            }
                        }
                    })
                    .catch(() => {
                        setShuntCompensatorInfos(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setShuntCompensatorInfos(null);
            }
        },
        [currentNode, studyUuid, snackError]
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
        (shuntCompensator) => {
            modifyShuntCompensator(
                studyUuid,
                currentNodeUuid,
                selectedId,
                sanitizeString(shuntCompensator[EQUIPMENT_NAME]),
                shuntCompensator[CHARACTERISTICS_CHOICE] ===
                    CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                    ? shuntCompensator[SUSCEPTANCE_PER_SECTION]
                    : null,
                shuntCompensator[CHARACTERISTICS_CHOICE] ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? shuntCompensator[Q_AT_NOMINAL_V]
                    : null,
                shuntCompensator[CHARACTERISTICS_CHOICE] ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? shuntCompensator[SHUNT_COMPENSATOR_TYPE]
                    : null,
                shuntCompensatorInfos?.voltageLevelId,
                !!editData,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShuntCompensatorModificationError',
                });
            });
        },
        [
            currentNodeUuid,
            studyUuid,
            editData,
            shuntCompensatorInfos?.voltageLevelId,
            snackError,
            selectedId,
        ]
    );

    return (
        <FormProvider
            validationSchema={formSchema}
            {...formMethods}
            removeOptional={true}
        >
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-shuntCompensator"
                titleId="ModifyShuntCompensator"
                open={open}
                disabledSave={disableSave}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {(selectedId == null || multiSections) && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type}
                        fillerHeight={5}
                    />
                )}
                {selectedId !== null &&
                    !multiSections &&
                    shuntCompensatorInfos !== null && (
                        <ShuntCompensatorModificationForm
                            shuntCompensatorInfos={shuntCompensatorInfos}
                            equipmentId={selectedId}
                        />
                    )}
            </ModificationDialog>
        </FormProvider>
    );
};

export default ShuntCompensatorModificationDialog;
