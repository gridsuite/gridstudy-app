/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import React, { useCallback, useEffect, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    DELETION_MARK,
    EQUIPMENT_NAME,
    NAME,
    PREVIOUS_VALUE,
    VALUE,
    ADDED,
} from 'components/utils/field-constants';
import SubstationModificationForm from './substation-modification-form';
import { sanitizeString } from '../../../dialogUtils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifySubstation } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import { resetEquipmentsSubstation } from '../../../../../redux/actions';
import { useDispatch } from 'react-redux';

const checkUniquePropertiesNames = (properties) => {
    const validValues = properties.filter((v) => v?.name);
    return validValues.length === new Set(validValues.map((v) => v.name)).size;
};

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [COUNTRY]: null,
    [ADDITIONAL_PROPERTIES]: null,
};

const formSchema = yup.object().shape({
    [EQUIPMENT_NAME]: yup.string(),
    [COUNTRY]: yup.string().nullable(),
    [ADDITIONAL_PROPERTIES]: yup
        .array()
        .nullable()
        .of(
            yup.object().shape({
                [NAME]: yup.string().nullable().required(),
                [VALUE]: yup
                    .string()
                    .nullable()
                    .when([PREVIOUS_VALUE, DELETION_MARK], {
                        is: (previousValue, deletionMark) =>
                            previousValue === null && deletionMark === false,
                        then: (schema) => schema.required(),
                    }),
                [PREVIOUS_VALUE]: yup.string().nullable(),
                [DELETION_MARK]: yup.boolean(),
                [ADDED]: yup.boolean(),
            })
        )
        .test('checkUniqueProperties', 'DuplicatedProps', (values) => {
            if (values) {
                return checkUniquePropertiesNames(values);
            }
            return true;
        }),
});

const getPropertiesFromModification = (properties) => {
    return properties
        ? properties.map((p) => {
              return {
                  [NAME]: p[NAME],
                  [VALUE]: p[VALUE],
                  [PREVIOUS_VALUE]: null,
                  [ADDED]: p[ADDED],
                  [DELETION_MARK]: p[DELETION_MARK],
              };
          })
        : null;
};

/**
 * Dialog to modify a substation in the network
 * @param editData the data to edit
 * @param defaultIdValue the default substation id
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const SubstationModificationDialog = ({
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
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [substationToModify, setSubstationToModify] = useState(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const dispatch = useDispatch();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, getValues } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData.equipmentName?.value ?? '',
                [COUNTRY]: editData.substationCountry?.value ?? null,
                [ADDITIONAL_PROPERTIES]: getPropertiesFromModification(
                    editData.properties
                ),
            });
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const createPropertyValuesFromExistingEquipement = (propKey, propValue) => {
        return {
            [NAME]: propKey,
            [VALUE]: null,
            [PREVIOUS_VALUE]: propValue,
            [DELETION_MARK]: false,
            [ADDED]: false,
        };
    };

    const getAdditionalProperties = useCallback(
        (equipmentInfos) => {
            let newModificationProperties = [];

            // comes from existing eqpt in network, ex: Object { p1: "v1", p2: "v2" }
            const equipmentProperties = equipmentInfos?.properties;
            // ex: current Array [ {Object {  name: "p1", value: "v2", previousValue: undefined, added: true, deletionMark: false } }, {...} ]
            const modificationProperties = getValues(
                `${ADDITIONAL_PROPERTIES}`
            );

            // Get every prop stored in the modification. if also present in the network, add its previous value.
            // Then add every prop found in the network (but not already in the modification)

            let equipmentPropertiesNames = [];
            let modificationPropertiesNames = [];
            if (equipmentProperties) {
                equipmentPropertiesNames = Object.keys(equipmentProperties);
            }
            if (modificationProperties) {
                modificationPropertiesNames = modificationProperties.map(
                    (obj) => obj[NAME]
                );

                modificationProperties.forEach(function (property) {
                    const previousValue = equipmentPropertiesNames.includes(
                        property[NAME]
                    )
                        ? equipmentProperties[property[NAME]]
                        : null;
                    newModificationProperties.push({
                        ...property,
                        [PREVIOUS_VALUE]: previousValue,
                    });
                });
            }

            if (equipmentProperties) {
                for (const [propKey, propValue] of Object.entries(
                    equipmentProperties
                )) {
                    if (
                        modificationPropertiesNames.includes(propKey) === false
                    ) {
                        newModificationProperties.push(
                            createPropertyValuesFromExistingEquipement(
                                propKey,
                                propValue
                            )
                        );
                    }
                }
            }
            return newModificationProperties;
        },
        [getValues]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (!equipmentId) {
                setSubstationToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    EQUIPMENT_TYPES.SUBSTATION,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((substation) => {
                        if (substation) {
                            setSubstationToModify(substation);
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]:
                                    getAdditionalProperties(substation),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setSubstationToModify(null);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [studyUuid, currentNodeUuid, reset, getAdditionalProperties, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (substation) => {
            const propertiesToUpdate = substation[
                ADDITIONAL_PROPERTIES
            ]?.filter((p) => p[VALUE] != null || p[DELETION_MARK]);

            modifySubstation(
                studyUuid,
                currentNodeUuid,
                selectedId,
                sanitizeString(substation[EQUIPMENT_NAME]),
                substation[COUNTRY],
                !!editData,
                editData?.uuid,
                propertiesToUpdate
            )
                .then(() => {
                    // if properties change then we need to reset substation spreadsheet in order to get the new values
                    if (propertiesToUpdate.length > 0) {
                        dispatch(resetEquipmentsSubstation());
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'SubstationModificationError',
                    });
                });
        },
        [currentNodeUuid, editData, snackError, studyUuid, selectedId, dispatch]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider
            validationSchema={formSchema}
            {...formMethods}
            removeOptional={true}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-substation"
                maxWidth={'md'}
                titleId="ModifySubstation"
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.SUBSTATION}
                        fillerHeight={5}
                    />
                )}
                {selectedId != null && (
                    <SubstationModificationForm
                        currentNode={currentNode}
                        studyUuid={studyUuid}
                        substationToModify={substationToModify}
                        equipmentId={selectedId}
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

export default SubstationModificationDialog;
