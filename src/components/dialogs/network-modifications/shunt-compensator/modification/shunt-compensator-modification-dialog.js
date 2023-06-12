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
    EQUIPMENT_ID,
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
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import {
    fetchEquipmentInfos,
    FetchStatus,
    modifyShuntCompensator,
} from '../../../../../utils/rest-api';
import ModificationDialog from '../../../commons/modificationDialog';
import ShuntCompensatorModificationForm from './shunt-compensator-modification-form';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { sanitizeString } from '../../../dialogUtils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getCharacteristicsEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getCharacteristicsFormValidationSchema(),
    })
    .required();

const ShuntCompensatorModificationDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [shuntCompensatorInfos, setShuntCompensatorInfos] = useState(null);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.equipmentId,
                [EQUIPMENT_NAME]: shuntCompensator.equipmentName ?? '',
                ...getCharacteristicsFormData({
                    susceptancePerSection:
                        shuntCompensator.susceptancePerSection,
                    qAtNominalV: shuntCompensator.qAtNominalV,
                    shuntCompensatorType: shuntCompensator.shuntCompensatorType,
                }),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
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
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    'shunt-compensators',
                    equipmentId,
                    true
                )
                    .then((shuntCompensator) => {
                        if (shuntCompensator) {
                            console.log(
                                'shuntCompensator : ',
                                shuntCompensator
                            );

                            setShuntCompensatorInfos(shuntCompensator);
                            setDataFetchStatus(FetchStatus.SUCCEED);
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
        [currentNodeUuid, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (shuntCompensator) => {
            modifyShuntCompensator(
                studyUuid,
                currentNodeUuid,
                shuntCompensator[EQUIPMENT_ID],
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
        ]
    );

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-shuntCompensator"
                titleId="ModifyShuntCompensator"
                open={open}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                <ShuntCompensatorModificationForm
                    studyUuid={studyUuid}
                    currentNodeUuid={currentNodeUuid}
                    onEquipmentIdChange={onEquipmentIdChange}
                    shuntCompensatorInfos={shuntCompensatorInfos}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default ShuntCompensatorModificationDialog;
