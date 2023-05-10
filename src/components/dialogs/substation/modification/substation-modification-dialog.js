/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../../utils/yup-config';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    DELETION_MARK,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    NAME,
    PREVIOUS_VALUE,
    VALUE,
    ADDED,
} from '../../../utils/field-constants';
import SubstationModificationForm from './substation-modification-form';
import {
    fetchEquipmentInfos,
    FetchStatus,
    modifySubstation,
} from '../../../../utils/rest-api';
import { sanitizeString } from '../../dialogUtils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';

const checkUniquePropertiesNames = (properties) => {
    const validValues = properties.filter((v) => v?.name);
    return validValues.length === new Set(validValues.map((v) => v.name)).size;
};

const formSchema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().nullable().required(),
    [EQUIPMENT_NAME]: yup.string(),
    [COUNTRY]: yup.string().nullable(),
    [ADDITIONAL_PROPERTIES]: yup
        .array()
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
        .test('checkUniqueProperties', 'DuplicatedProps', (values) =>
            checkUniquePropertiesNames(values)
        ),
});

const getPropertiesFromModification = (properties) => {
    return properties
        ? properties.map((p) => {
              return {
                  [NAME]: p[NAME],
                  [VALUE]: p[VALUE],
                  [PREVIOUS_VALUE]: null,
                  [ADDED]: true,
                  [DELETION_MARK]: p[DELETION_MARK],
              };
          })
        : null;
};

/**
 * Dialog to modify a substation in the network
 * @param editData the data to edit
 * @param defaultIdValue the default equipment id
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const SubstationModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [substationToModify, setSubstationToModify] = useState(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_ID]: defaultIdValue ?? null,
            [EQUIPMENT_NAME]: '',
            [COUNTRY]: null,
            [ADDITIONAL_PROPERTIES]: null,
        }),
        [defaultIdValue]
    );

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, getValues } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
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
    }, [reset, emptyFormData]);

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
                        [ADDED]: true,
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

    const getModificationProperties = useCallback(() => {
        let newModificationProperties = [];
        // ex: Array [ {Object {  name: "p1", value: "v2", previousValue: undefined, added: true, deletionMark: false } }, {...} ]
        const modificationProperties = getValues(`${ADDITIONAL_PROPERTIES}`);
        if (modificationProperties) {
            modificationProperties.forEach(function (property) {
                if (property[ADDED]) {
                    newModificationProperties.push({
                        ...property,
                    });
                }
            });
        }
        return newModificationProperties;
    }, [getValues]);

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    'substations',
                    equipmentId,
                    true
                )
                    .then((substation) => {
                        if (substation) {
                            setSubstationToModify(substation);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]:
                                        getAdditionalProperties(substation),
                                }),
                                { keepDefaultValues: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setSubstationToModify(null);
                        reset(
                            (formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]:
                                    getModificationProperties(),
                            }),
                            { keepDefaultValues: true }
                        );
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setSubstationToModify(null);
                reset(
                    (formValues) => ({
                        ...formValues,
                        [ADDITIONAL_PROPERTIES]: getModificationProperties(),
                    }),
                    { keepDefaultValues: true }
                );
            }
        },
        [
            studyUuid,
            currentNodeUuid,
            reset,
            getAdditionalProperties,
            getModificationProperties,
        ]
    );

    const onSubmit = useCallback(
        (substation) => {
            modifySubstation(
                studyUuid,
                currentNodeUuid,
                substation[EQUIPMENT_ID],
                sanitizeString(substation[EQUIPMENT_NAME]),
                substation[COUNTRY],
                !!editData,
                editData?.uuid,
                substation[ADDITIONAL_PROPERTIES].filter(
                    (p) => p[VALUE] != null || p[DELETION_MARK]
                )
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'SubstationModificationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
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
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                <SubstationModificationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    substationToModify={substationToModify}
                    onEquipmentIdChange={onEquipmentIdChange}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default SubstationModificationDialog;
