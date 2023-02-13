/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPE, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    PERMANENT_LIMIT,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { createLine } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import { UNDEFINED_CONNECTION_DIRECTION } from '../../../network/constants';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LineCreationForm from './line-creation-form';

/**
 * Dialog to create a load in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param onCreateLine callback to customize line creation process
 * @param displayConnectivity to display connectivity section or not
 * @param voltageLevelOptionsPromise a promise that will bring available voltage levels
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [EQUIPMENT_ID]: null,
    [EQUIPMENT_NAME]: '',
    ...getConnectivityEmptyFormData(CONNECTIVITY_1),
    ...getConnectivityEmptyFormData(CONNECTIVITY_2),
    [SERIES_RESISTANCE]: null,
    [SERIES_REACTANCE]: null,
    [SHUNT_SUSCEPTANCE_1]: null,
    [SHUNT_CONDUCTANCE_1]: null,
    [SHUNT_SUSCEPTANCE_2]: null,
    [SHUNT_CONDUCTANCE_2]: null,
    [CURRENT_LIMITS_1]: { [PERMANENT_LIMIT]: null },
    [CURRENT_LIMITS_2]: { [PERMANENT_LIMIT]: null },
};

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_1),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_2),
        [SERIES_RESISTANCE]: yup.number().nullable().required(),
        [SERIES_REACTANCE]: yup.number().nullable().required(),
        [SHUNT_SUSCEPTANCE_1]: yup.number(),
        [SHUNT_CONDUCTANCE_1]: yup.number(),
        [SHUNT_SUSCEPTANCE_2]: yup.number(),
        [SHUNT_CONDUCTANCE_2]: yup.number(),
        [CURRENT_LIMITS_1]: yup.object().shape({
            [PERMANENT_LIMIT]: yup.number().nullable(),
        }),
        [CURRENT_LIMITS_2]: yup.object().shape({
            [PERMANENT_LIMIT]: yup
                .number()
                .nullable()
                .positive('permanentCurrentLimitGreaterThanZero'),
        }),
    })
    .required();

const LineCreationDialog = ({
    editData,
    currentNodeUuid,
    onCreateLine = createLine,
    displayConnectivity = true,
    voltageLevelOptionsPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'lines';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromSearchCopyToFormValues = (line) => {
        reset({
            [EQUIPMENT_ID]: line.id + '(1)',
            [EQUIPMENT_NAME]: line.name ?? '',
            [SHUNT_CONDUCTANCE_1]: line.g1,
            [SHUNT_SUSCEPTANCE_1]: line.b1,
            [SHUNT_CONDUCTANCE_2]: line.g2,
            [SHUNT_SUSCEPTANCE_2]: line.b2,
            [SERIES_RESISTANCE]: line.r,
            [SERIES_REACTANCE]: line.x,
            [CURRENT_LIMITS_1]: {
                [PERMANENT_LIMIT]: line.permanentLimit1,
            },
            [CURRENT_LIMITS_2]: {
                [PERMANENT_LIMIT]: line.permanentLimit2,
            },
            ...getConnectivityFormData(
                {
                    voltageLevelId: line.voltageLevelId1,
                    busbarSectionId: null,
                    connectionDirection: line.connectionDirection1,
                    connectionName: line.connectionName1,
                    connectionPosition: line.connectionPosition1,
                },
                CONNECTIVITY_1
            ),
            ...getConnectivityFormData(
                {
                    voltageLevelId: line.voltageLevelId2,
                    busbarSectionId: null,
                    connectionDirection: line.connectionDirection2,
                    connectionName: line.connectionName2,
                    connectionPosition: line.connectionPosition2,
                },
                CONNECTIVITY_2
            ),
        });
    };

    const fromEditDataToFormValues = useCallback(
        (line) => {
            reset({
                [EQUIPMENT_ID]: line.equipmentId,
                [EQUIPMENT_NAME]: line.equipmentName ?? '',
                [SHUNT_CONDUCTANCE_1]: line.shuntConductance1,
                [SHUNT_SUSCEPTANCE_1]: line.shuntSusceptance1,
                [SHUNT_CONDUCTANCE_2]: line.shuntConductance2,
                [SHUNT_SUSCEPTANCE_2]: line.shuntSusceptance2,
                [SERIES_RESISTANCE]: line.seriesResistance,
                [SERIES_REACTANCE]: line.seriesReactance,
                [CURRENT_LIMITS_1]: {
                    [PERMANENT_LIMIT]: line.currentLimits1?.permanentLimit,
                },
                [CURRENT_LIMITS_2]: {
                    [PERMANENT_LIMIT]: line.currentLimits2?.permanentLimit,
                },
                ...getConnectivityFormData(
                    {
                        voltageLevelId: line.voltageLevelId1,
                        busbarSectionId: line.busOrBusbarSectionId1,
                        connectionDirection: line.connectionDirection1,
                        connectionName: line.connectionName1,
                        connectionPosition: line.connectionPosition1,
                    },
                    CONNECTIVITY_1
                ),
                ...getConnectivityFormData(
                    {
                        voltageLevelId: line.voltageLevelId2,
                        busbarSectionId: line.busOrBusbarSectionId2,
                        connectionDirection: line.connectionDirection2,
                        connectionName: line.connectionName2,
                        connectionPosition: line.connectionPosition2,
                    },
                    CONNECTIVITY_2
                ),
            });
        },
        [reset]
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
        (line) => {
            createLine(
                studyUuid,
                currentNodeUuid,
                line[EQUIPMENT_ID],
                sanitizeString(line[EQUIPMENT_NAME]),
                line.seriesResistance,
                line.seriesReactance,
                line.ShuntConductance1,
                line.shuntSusceptance1,
                line.ShuntConductance2,
                line.shuntSusceptance2,
                line.connectivity1?.voltageLevel?.id,
                line.connectivity1?.busOrBusbarSection?.id,
                line.connectivity2?.voltageLevel?.id,
                line.connectivity2?.busOrBusbarSection?.id,
                line.currentLimits1?.permanentLimit,
                line.currentLimits2?.permanentLimit,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                line.connectivity1?.connectionName ?? null,
                line.connectivity1?.connectionDirection ??
                    UNDEFINED_CONNECTION_DIRECTION,
                line.connectivity2?.connectionName ?? null,
                line.connectivity2?.connectionDirection ??
                    UNDEFINED_CONNECTION_DIRECTION,
                line.connectivity1?.connectionPosition ?? null,
                line.connectivity2?.connectionPosition ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineCreationError',
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
                aria-labelledby="dialog-create-line"
                maxWidth={'md'}
                titleId="CreateLine"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <LineCreationForm
                    displayConnectivity={displayConnectivity}
                    voltageLevelOptionsPromise={voltageLevelOptionsPromise}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPE.LINE.name}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LineCreationDialog.propTypes = {
    editData: PropTypes.object,
    currentNodeUuid: PropTypes.string,
};

export default LineCreationDialog;
