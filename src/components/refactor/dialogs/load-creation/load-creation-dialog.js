/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    P0,
    ID,
    NAME,
    LOAD_TYPE,
    Q0,
    CONNECTIVITY,
    VOLTAGE_LEVEL,
    BUS_OR_BUSBAR_SECTION,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { createLoad, fetchEquipmentInfos } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LoadCreationForm from './load-creation-form';

/**
 * Dialog to create a load in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [ID]: '',
    [NAME]: '',
    [LOAD_TYPE]: null,
    [P0]: null,
    [Q0]: null,
    ...getConnectivityEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [ID]: yup.string().required(),
        [NAME]: yup.string(),
        [LOAD_TYPE]: yup.string().nullable(),
        [P0]: yup.number().nullable().required(),
        [Q0]: yup.number().nullable().required(),
        ...getConnectivityFormValidationSchema(),
    })
    .required();

const LoadCreationDialog = ({
    editData,
    currentNodeUuid,
    voltageLevelOptionsPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'loads';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromSearchCopyToFormValues = (load) => {
        fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            'voltage-levels',
            load.voltageLevelId,
            true
        ).then((vlResult) => {
            reset({
                [ID]: load.id + '(1)',
                [NAME]: load.name ?? '',
                [LOAD_TYPE]: load.type,
                [P0]: load.p0,
                [Q0]: load.q0,
                ...getConnectivityFormData({
                    voltageLevelId: load.voltageLevelId,
                    voltageLevelTopologyKind: vlResult.topologyKind,
                    voltageLevelName: vlResult.name,
                    voltageLevelNominalVoltage: vlResult.nominalVoltage,
                    voltageLevelSubstationId: vlResult.substationId,
                    connectionDirection: load.connectionDirection,
                    connectionName: load.connectionName,
                    connectionPosition: load.connectionPosition,
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
            )
                .then((vlResult) => {
                    reset({
                        [ID]: load.id,
                        [NAME]: load.name ?? '',
                        [LOAD_TYPE]: load.loadType,
                        [P0]: load.activePower,
                        [Q0]: load.reactivePower,
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
                }) // if voltage level can't be found, we fill the form with minimal infos
                .catch(() => {
                    reset({
                        [ID]: load.id,
                        [NAME]: load.name ?? '',
                        [LOAD_TYPE]: load.loadType,
                        [P0]: load.activePower,
                        [Q0]: load.reactivePower,
                        ...getConnectivityFormData({
                            voltageLevelId: load.voltageLevelId,
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
            const loadToSave = {
                ...load,
                ...load?.[CONNECTIVITY],
                voltageLevelId: load[CONNECTIVITY][VOLTAGE_LEVEL][ID],
                busOrBusbarSectionId:
                    load[CONNECTIVITY][BUS_OR_BUSBAR_SECTION][ID],
                [NAME]: sanitizeString(load[NAME]),
            };

            //removing properties that don't need to be sent to backend
            delete loadToSave[CONNECTIVITY];
            delete loadToSave[VOLTAGE_LEVEL];
            delete loadToSave[BUS_OR_BUSBAR_SECTION];

            createLoad(
                studyUuid,
                currentNodeUuid,
                loadToSave,
                editData ? true : false,
                editData ? editData.uuid : undefined
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
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-load"
                maxWidth={'md'}
                titleId="CreateLoad"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <LoadCreationForm
                    voltageLevelOptionsPromise={voltageLevelOptionsPromise}
                />

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
