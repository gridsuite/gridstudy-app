/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import {
    ADDITIONAL_PROPERTIES,
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
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormValidationSchema,
} from '../characteristics-pane/characteristics-form-utils';
import { useForm } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useEffect, useState } from 'react';
import ModificationDialog from '../../../commons/modificationDialog';
import ShuntCompensatorModificationForm from './shunt-compensator-modification-form';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import {
    FORM_LOADING_DELAY,
    UNDEFINED_CONNECTION_DIRECTION,
} from '../../../../network/constants';
import { sanitizeString } from '../../../dialogUtils';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../../../utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyShuntCompensator } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils.js';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getConnectivityWithPositionEmptyFormData(),
    ...getCharacteristicsEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        ...getConnectivityWithPositionValidationSchema(),
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
            if (shuntCompensator?.equipmentId) {
                setSelectedId(shuntCompensator.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: shuntCompensator?.equipmentName?.value ?? '',
                ...getConnectivityFormData({
                    voltageLevelId:
                        shuntCompensator.voltageLevelId?.value ?? null,
                    busbarSectionId:
                        shuntCompensator?.busOrBusbarSectionId?.value ?? null,
                    connectionName:
                        shuntCompensator.connectionName?.value ?? '',
                    connectionDirection:
                        shuntCompensator.connectionDirection?.value ?? null,
                    connectionPosition:
                        shuntCompensator.connectionPosition?.value ?? null,
                    connected: shuntCompensator.connected?.value ?? false,
                }),
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
        [reset]
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
                    true
                )
                    .then((shuntCompensator) => {
                        if (shuntCompensator) {
                            if (!shuntCompensator.isLinear) {
                                snackError({
                                    headerId: 'ShuntCompensatorNonlinearError',
                                });
                                setSelectedId(null);
                            } else {
                                setShuntCompensatorInfos(shuntCompensator);
                                setDataFetchStatus(FetchStatus.SUCCEED);
                                reset((formValues) => ({
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]:
                                        getConcatenatedProperties(
                                            shuntCompensator,
                                            getValues
                                        ),
                                }));
                            }
                        }
                        setLoading(false);
                    })
                    .catch((error) => {
                        setShuntCompensatorInfos(null);
                        setDataFetchStatus(FetchStatus.FAILED);
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
        [currentNode.id, snackError, studyUuid, reset, getValues]
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
                shuntCompensator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                shuntCompensator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                sanitizeString(
                    shuntCompensator[CONNECTIVITY]?.[CONNECTION_NAME]
                ),
                shuntCompensator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                shuntCompensator[CONNECTIVITY]?.[CONNECTION_POSITION],
                shuntCompensator[CONNECTIVITY]?.[CONNECTED],
                !!editData,
                editData?.uuid,
                toModificationProperties(shuntCompensator)
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShuntCompensatorModificationError',
                });
            });
        },
        [currentNodeUuid, studyUuid, editData, snackError, selectedId]
    );

    return (
        <CustomFormProvider
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
                            studyUuid={studyUuid}
                            currentNode={currentNode}
                            shuntCompensatorInfos={shuntCompensatorInfos}
                            equipmentId={selectedId}
                        />
                    )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ShuntCompensatorModificationDialog;
