/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ModificationDialog from '../modificationDialog';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { createLoad, fetchEquipmentInfos } from '../../../../utils/rest-api';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LoadCreationForm from './load-creation-form';
import { useSchemaCheck } from '../../utils/use-schema-check';
import {
    UNDEFINED_CONNECTION_DIRECTION,
    UNDEFINED_LOAD_TYPE,
} from '../../../network/constants';
import { sanitizeString } from '../../../dialogs/dialogUtils';

/**
 * Dialog to create a load in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

export const EQUIPMENT_ID = 'equipmentId';
export const EQUIPMENT_NAME = 'equipmentName';
export const EQUIPMENT_TYPE = 'loadType';
export const ACTIVE_POWER = 'activePower';
export const REACTIVE_POWER = 'reactivePower';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [EQUIPMENT_TYPE]: null,
    [ACTIVE_POWER]: '',
    [REACTIVE_POWER]: '',
    ...getConnectivityEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [EQUIPMENT_TYPE]: yup.string().nullable(true),
        [ACTIVE_POWER]: yup.string().nullableNumber().required(),
        [REACTIVE_POWER]: yup.string().nullableNumber().required(),
        ...getConnectivityFormValidationSchema(),
    })
    .required();

const LoadCreationDialog = ({ editData, currentNodeUuid, ...dialogProps }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'loads';

    const [isFieldRequired] = useSchemaCheck(schema);

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const {
        reset,
        formState: { isDirty },
    } = methods;

    const fromSearchCopyToFormValues = (load) => {
        fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            'voltage-levels',
            load.voltageLevelId,
            true
        ).then((vlResult) => {
            reset({
                [EQUIPMENT_ID]: load.id + '(1)',
                [EQUIPMENT_NAME]: load.name ?? '',
                [EQUIPMENT_TYPE]: load.type,
                [ACTIVE_POWER]: load.p0,
                [REACTIVE_POWER]: load.q0,
                ...getConnectivityFormData({
                    voltageLevelId: load.voltageLevelId,
                    voltageLevelTopologyKind: vlResult.topologyKind,
                    voltageLevelName: vlResult.name,
                    voltageLevelNominalVoltage: vlResult.nominalVoltage,
                    voltageLevelSubstationId: vlResult.substationId,
                }),
            });
        });
    };

    const fromEditDataToFormValues = useCallback(
        (load) => {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'voltage-levels',
                load.voltageLevelId,
                true
            ).then((vlResult) => {
                reset({
                    [EQUIPMENT_ID]: load.equipmentId,
                    [EQUIPMENT_NAME]: load.equipmentName ?? '',
                    [EQUIPMENT_TYPE]: load.loadType,
                    [ACTIVE_POWER]: load.activePower,
                    [REACTIVE_POWER]: load.reactivePower,
                    ...getConnectivityFormData({
                        voltageLevelId: load.voltageLevelId,
                        voltageLevelTopologyKind: vlResult.topologyKind,
                        voltageLevelName: vlResult.name,
                        voltageLevelNominalVoltage: vlResult.nominalVoltage,
                        voltageLevelSubstationId: vlResult.substationId,
                        busbarSectionId: load.busOrBusbarSectionId,
                        connectionDirection: load.connectionDirection,
                        connectionName: load.connectionName,
                        connectionPosition: load.connectionPosition,
                    }),
                });
            });
        },
        [studyUuid, currentNodeUuid, reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (load) => {
            createLoad(
                studyUuid,
                currentNodeUuid,
                load[EQUIPMENT_ID],
                sanitizeString(load[EQUIPMENT_NAME]),
                !load[EQUIPMENT_TYPE]
                    ? UNDEFINED_LOAD_TYPE
                    : load[EQUIPMENT_TYPE],
                load[ACTIVE_POWER],
                load[REACTIVE_POWER],
                load.connectivity.voltageLevel.id,
                load.connectivity.busOrBusbarSection.id,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                load.connectivity?.connectionDirection ??
                    UNDEFINED_CONNECTION_DIRECTION,
                load.connectivity?.connectionName ?? null,
                load.connectivity?.connectionPosition ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadCreationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider isFieldRequired={isFieldRequired} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                disabledSave={!isDirty}
                aria-labelledby="dialog-create-load"
                maxWidth={'md'}
                titleId="CreateLoad"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <LoadCreationForm />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'LOAD'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LoadCreationDialog.propTypes = {
    editData: PropTypes.object,
    currentNodeUuid: PropTypes.string,
};

export default LoadCreationDialog;
