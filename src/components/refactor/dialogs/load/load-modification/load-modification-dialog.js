/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { fetchEquipmentInfos, modifyLoad } from '../../../../../utils/rest-api';
import { sanitizeString } from '../../../../dialogs/dialogUtils';
import yup from '../../../utils/yup-config';
import ModificationDialog from '../../commons/modificationDialog';
import LoadModificationForm from './load-modification-form';
import { getPreviousValueFieldName } from '../../../utils/utils';
import { getLoadTypeLabel } from '../../../../network/constants';
import { useIntl } from 'react-intl';

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default load id
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().nullable().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [LOAD_TYPE]: yup.string().nullable(),
        [ACTIVE_POWER]: yup.number().nullable(),
        [REACTIVE_POWER]: yup.number().nullable(),
    })
    .required();

const assignEditDataValuesToForm = (load) => {
    return {
        [EQUIPMENT_ID]: load.equipmentId,
        [EQUIPMENT_NAME]: load.equipmentName?.value ?? '',
        [LOAD_TYPE]: load.loadType?.value ?? null,
        [ACTIVE_POWER]: load.activePower?.value ?? null,
        [REACTIVE_POWER]: load.reactivePower?.value ?? null,
    };
};

const assignFetchedValuesToFrom = (load, loadId, intl) => {
    const type =
        load.type || load.type === 'UNDEFINED'
            ? ''
            : intl.formatMessage({
                  id: getLoadTypeLabel(load?.type),
              });

    return {
        [EQUIPMENT_ID]: loadId,
        [getPreviousValueFieldName(EQUIPMENT_NAME)]: load.name ?? '',
        [getPreviousValueFieldName(LOAD_TYPE)]: type,
        [getPreviousValueFieldName(ACTIVE_POWER)]: load.p0 ?? null,
        [getPreviousValueFieldName(REACTIVE_POWER)]: load.q0 ?? null,
    };
};
const LoadModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_ID]: defaultIdValue ?? null,
            [EQUIPMENT_NAME]: '',
            [LOAD_TYPE]: null,
            [ACTIVE_POWER]: null,
            [REACTIVE_POWER]: null,
        }),
        [defaultIdValue]
    );

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const onSubmit = useCallback(
        (load) => {
            modifyLoad(
                studyUuid,
                currentNodeUuid,
                load?.equipmentId,
                sanitizeString(load?.equipmentName),
                load?.loadType,
                load?.activePower,
                load?.reactivePower,
                undefined,
                undefined,
                !!editData,
                editData ? editData.uuid : undefined
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadModificationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset, emptyFormData]);

    const onEquipmentIdChange = useCallback(
        (loadId) => {
            if (loadId) {
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    'loads',
                    loadId,
                    true
                ).then((value) => {
                    if (value) {
                        if (editData && editData.equipmentId === loadId) {
                            reset(
                                assignFetchedValuesToFrom(value, loadId, intl),
                                {
                                    keepDirtyValues: true,
                                }
                            );
                        } else {
                            reset({
                                ...emptyFormData,
                                ...assignFetchedValuesToFrom(
                                    value,
                                    loadId,
                                    intl
                                ),
                            });
                        }
                    }
                });
            } else {
                clear();
            }
        },
        [
            clear,
            currentNodeUuid,
            editData,
            emptyFormData,
            intl,
            reset,
            studyUuid,
        ]
    );

    useEffect(() => {
        if (editData) {
            reset({
                ...assignEditDataValuesToForm(editData),
            });
        }
    }, [editData, reset]);

    return (
        <FormProvider
            validationSchema={schema}
            {...methods}
            isEdit={editData ? true : false}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-load"
                maxWidth={'md'}
                titleId="ModifyLoad"
                {...dialogProps}
            >
                <LoadModificationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    onEquipmentIdChange={onEquipmentIdChange}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LoadModificationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default LoadModificationDialog;
