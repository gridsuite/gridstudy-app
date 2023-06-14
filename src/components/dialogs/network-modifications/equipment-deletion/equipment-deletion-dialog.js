/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    TYPE,
    EQUIPMENT_ID,
    SHUNT_COMPENSATOR_SIDE_1,
    SHUNT_COMPENSATOR_SIDE_2,
    HVDC_WITH_LCC,
    ID,
    SELECTED,
} from '../../../utils/field-constants';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormProvider, useForm } from 'react-hook-form';
import React, { useCallback, useEffect } from 'react';
import {
    deleteEquipment,
    fetchHvdcLineWithShuntCompensators,
    FetchStatus,
} from 'utils/rest-api';
import ModificationDialog from '../../commons/modificationDialog';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import DeleteEquipmentForm from './equipment-deletion-form';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.object().nullable().required(),
        [EQUIPMENT_ID]: yup.string().nullable().required(),
        [HVDC_WITH_LCC]: yup.boolean(),
        [SHUNT_COMPENSATOR_SIDE_1]: yup.array().of(
            yup.object().shape({
                [ID]: yup.string(),
                [SELECTED]: yup.boolean(),
            })
        ),
        [SHUNT_COMPENSATOR_SIDE_2]: yup.array().of(
            yup.object().shape({
                [ID]: yup.string(),
                [SELECTED]: yup.boolean(),
            })
        ),
    })
    .required();

const emptyFormData = {
    [TYPE]: EQUIPMENT_TYPES.LINE,
    [EQUIPMENT_ID]: null,
    [HVDC_WITH_LCC]: false,
    [SHUNT_COMPENSATOR_SIDE_1]: [],
    [SHUNT_COMPENSATOR_SIDE_2]: [],
};

/**
 * Dialog to delete an equipment from its type and ID.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const EquipmentDeletionDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData) => {
            console.log('DBR fromEditDataToFormValues', editData);
            reset({
                [TYPE]: EQUIPMENT_TYPES[editData.equipmentType],
                [EQUIPMENT_ID]: editData.equipmentId,
                [HVDC_WITH_LCC]: editData.hvdcWithLCC,
                [SHUNT_COMPENSATOR_SIDE_1]: editData.mcsOnSide1,
                [SHUNT_COMPENSATOR_SIDE_2]: editData.mcsOnSide2,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (formData) => {
            console.log('DBR submit', formData);
            const equipmentType = formData[TYPE];
            let mscIds =
                formData[HVDC_WITH_LCC] === false
                    ? []
                    : formData[SHUNT_COMPENSATOR_SIDE_1].concat(
                          formData[SHUNT_COMPENSATOR_SIDE_2]
                      )
                          .filter((m) => m[SELECTED])
                          .map((m) => m[ID]);
            console.log('DBR submit mscIds', mscIds);
            deleteEquipment(
                studyUuid,
                currentNodeUuid,
                equipmentType.type,
                formData[EQUIPMENT_ID],
                formData[HVDC_WITH_LCC],
                formData[SHUNT_COMPENSATOR_SIDE_1],
                formData[SHUNT_COMPENSATOR_SIDE_2],
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'UnableToDeleteEquipment',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const updateMcsList = useCallback(
        (hvdcLineData) => {
            const withLcc = hvdcLineData
                ? hvdcLineData.hvdcType === 'LCC'
                : false;
            setValue(HVDC_WITH_LCC, withLcc);
            setValue(
                SHUNT_COMPENSATOR_SIDE_1,
                withLcc ? hvdcLineData.mcsOnSide1 : []
            );
            setValue(
                SHUNT_COMPENSATOR_SIDE_2,
                withLcc ? hvdcLineData.mcsOnSide2 : []
            );
        },
        [setValue]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId, equipmentType) => {
            console.log('DBR onEquipmentIdChange editData', editData);
            console.log('DBR onEquipmentIdChange id', equipmentId);
            console.log('DBR onEquipmentIdChange type', equipmentType);
            console.log(
                'DBR onEquipmentIdChange test',
                equipmentType === EQUIPMENT_TYPES.HVDC_LINE.type
            );
            if (editData && editData.equipmentId === equipmentId) {
                return;
            }
            if (
                equipmentId &&
                equipmentType === EQUIPMENT_TYPES.HVDC_LINE.type
            ) {
                console.log('DBR onEquipmentIdChange IF');
                // need a specific rest call to get MCS lists
                fetchHvdcLineWithShuntCompensators(
                    studyUuid,
                    currentNodeUuid,
                    equipmentId
                )
                    .then((hvdcLineData) => {
                        console.log(
                            'DBR onEquipmentIdChange FETCH',
                            hvdcLineData
                        );
                        updateMcsList(hvdcLineData);
                    })
                    .catch((error) => {
                        updateMcsList(null);
                        snackError({
                            messageTxt: error.message,
                            headerId: 'HVDCLineConverterStationError',
                        });
                    });
            } else {
                updateMcsList(null);
            }
        },
        [studyUuid, currentNodeUuid, updateMcsList, snackError, editData]
    );

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-equipment-deletion"
                titleId="DeleteEquipment"
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <DeleteEquipmentForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    onEquipmentIdChange={onEquipmentIdChange}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

EquipmentDeletionDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editData: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default EquipmentDeletionDialog;
