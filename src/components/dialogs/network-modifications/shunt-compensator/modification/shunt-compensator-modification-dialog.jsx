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
    MAXIMUM_SECTION_COUNT,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    ADDITIONAL_PROPERTIES,
} from '../../../../utils/field-constants';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormValidationSchema,
} from '../characteristics-pane/characteristics-form-utils';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useEffect, useState } from 'react';
import ModificationDialog from '../../../commons/modificationDialog';
import ShuntCompensatorModificationForm from './shunt-compensator-modification-form';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { sanitizeString } from '../../../dialogUtils';
import {
    EQUIPMENT_INFOS_OPERATION,
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../../../utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyShuntCompensator } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getPropertiesFromModification,
    mergeModificationAndEquipmentProperties,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getCharacteristicsEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        ...getCharacteristicsFormValidationSchema(true),
    })
    .concat(modificationPropertiesSchema)
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
    const [idExists, setIdExists] = useState(null);
    const [loading, setLoading] = useState(false);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        formState: { dirtyFields },
        getValues,
    } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_NAME]: shuntCompensator?.equipmentName?.value ?? '',
                ...getCharacteristicsFormData({
                    maxSusceptance:
                        shuntCompensator.maxSusceptance?.value ?? null,
                    maxQAtNominalV:
                        shuntCompensator.maxQAtNominalV?.value ?? null,
                    shuntCompensatorType:
                        shuntCompensator.shuntCompensatorType?.value ?? null,
                    sectionCount: shuntCompensator.sectionCount?.value ?? null,
                    maximumSectionCount:
                        shuntCompensator.maximumSectionCount?.value ?? null,
                }),
                ...getPropertiesFromModification(shuntCompensator.properties),
            });
        },
        [reset],
    );
    const getConcatenatedProperties = useCallback(
        (equipment) => {
            const modificationProperties = getValues(
                `${ADDITIONAL_PROPERTIES}`,
            );
            return mergeModificationAndEquipmentProperties(
                modificationProperties,
                equipment,
            );
        },
        [getValues],
    );

    // If we only change the characteristics choice without changing the corresponding fields,
    // we keep the validate button disable: if we choose "susceptance", we have to add a value for
    // "susceptance per section", and if we choose "Q at nominal voltage", we have to add a value for
    // "shunt compensator type" or for "Q at nominal voltage" numeric field
    const disableSave =
        (Object.keys(dirtyFields).length === 1 &&
            dirtyFields[CHARACTERISTICS_CHOICE]) ||
        Object.keys(dirtyFields).length === 0;

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
                setLoading(true);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true,
                    EQUIPMENT_INFOS_OPERATION.MODIFICATION,
                )
                    .then((shuntCompensator) => {
                        if (shuntCompensator) {
                            setShuntCompensatorInfos(shuntCompensator);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]:
                                    getConcatenatedProperties(shuntCompensator),
                            }));
                        }
                        setLoading(false);
                    })
                    .catch((error) => {
                        setShuntCompensatorInfos(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (error.status === 501) {
                            snackError({
                                headerId: 'ShuntCompensatorNonlinearError',
                            });
                            setSelectedId(null);
                        }
                        if (error.status === 404) {
                            setIdExists(true);
                        }
                        setLoading(false);
                        reset(emptyFormData);
                    });
            } else {
                setShuntCompensatorInfos(null);
            }
        },
        [
            currentNode?.id,
            snackError,
            studyUuid,
            reset,
            getConcatenatedProperties,
        ],
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
                shuntCompensator[MAXIMUM_SECTION_COUNT],
                shuntCompensator[SECTION_COUNT],
                shuntCompensator[CHARACTERISTICS_CHOICE] ===
                    CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                    ? shuntCompensator[MAX_SUSCEPTANCE]
                    : null,
                shuntCompensator[CHARACTERISTICS_CHOICE] ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? shuntCompensator[MAX_Q_AT_NOMINAL_V]
                    : null,
                shuntCompensator[CHARACTERISTICS_CHOICE] ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? shuntCompensator[SHUNT_COMPENSATOR_TYPE]
                    : null,
                shuntCompensatorInfos?.voltageLevelId,
                !!editData,
                editData?.uuid,
                toModificationProperties(shuntCompensator),
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
        ],
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
                {!shuntCompensatorInfos && !idExists && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.SHUNT_COMPENSATOR}
                        fillerHeight={5}
                        loading={loading}
                    />
                )}
                {selectedId !== null &&
                    !loading &&
                    (shuntCompensatorInfos ||
                        // The case for creating a Shunt Compensator with free text in the selector
                        idExists) && (
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
