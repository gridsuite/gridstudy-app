/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
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
    VOLTAGE_LEVEL,
} from 'components/refactor/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
 * Dialog to create a line in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param onCreateLine callback to customize line creation process
 * @param displayConnectivity to display connectivity section or not
 * @param voltageLevelOptionsPromise a promise that will bring available voltage levels
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
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

const LineCreationDialog = ({
    editData,
    studyUuid,
    currentNode,
    onCreateLine = createLine,
    displayConnectivity = true,
    voltageLevelOptionsPromise,
    ...dialogProps
}) => {
    const schema = yup
        .object()
        .shape({
            [EQUIPMENT_ID]: yup.string().required(),
            [EQUIPMENT_NAME]: yup.string(),
            ...(displayConnectivity &&
                getConnectivityFormValidationSchema(CONNECTIVITY_1)),
            ...(displayConnectivity &&
                getConnectivityFormValidationSchema(CONNECTIVITY_2)),
            [SERIES_RESISTANCE]: yup.number().nullable().required(),
            [SERIES_REACTANCE]: yup.number().nullable().required(),
            [SHUNT_SUSCEPTANCE_1]: yup.number().nullable(),
            [SHUNT_CONDUCTANCE_1]: yup.number().nullable(),
            [SHUNT_SUSCEPTANCE_2]: yup.number().nullable(),
            [SHUNT_CONDUCTANCE_2]: yup.number().nullable(),
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

    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const equipmentPath = 'lines';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromSearchCopyToFormValues = (line) => {
        reset(
            {
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
                ...(displayConnectivity &&
                    getConnectivityFormData(
                        {
                            voltageLevelId: line.voltageLevelId1,
                            busbarSectionId: line.busOrBusbarSectionId1,
                            connectionDirection: line.connectionDirection1,
                            connectionName: line.connectionName1,
                            connectionPosition: line.connectionPosition1,
                        },
                        CONNECTIVITY_1
                    )),
                ...(displayConnectivity &&
                    getConnectivityFormData(
                        {
                            voltageLevelId: line.voltageLevelId2,
                            busbarSectionId: line.busOrBusbarSectionId2,
                            connectionDirection: line.connectionDirection2,
                            connectionName: line.connectionName2,
                            connectionPosition: line.connectionPosition2,
                        },
                        CONNECTIVITY_2
                    )),
            },
            { keepDefaultValues: true }
        );
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
            onCreateLine(
                studyUuid,
                currentNodeUuid,
                line[EQUIPMENT_ID],
                sanitizeString(line[EQUIPMENT_NAME]),
                line[SERIES_RESISTANCE],
                line[SERIES_REACTANCE],
                line[SHUNT_CONDUCTANCE_1],
                line[SHUNT_SUSCEPTANCE_1],
                line[SHUNT_CONDUCTANCE_2],
                line[SHUNT_SUSCEPTANCE_2],
                line[CONNECTIVITY_1]?.[VOLTAGE_LEVEL]?.id,
                line[CONNECTIVITY_1]?.[BUS_OR_BUSBAR_SECTION]?.id,
                line[CONNECTIVITY_2]?.[VOLTAGE_LEVEL]?.id,
                line[CONNECTIVITY_2]?.[BUS_OR_BUSBAR_SECTION]?.id,
                line[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                line[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                editData ? true : false,
                editData ? editData.uuid : undefined,
                sanitizeString(line[CONNECTIVITY_1]?.[CONNECTION_NAME]),
                line[CONNECTIVITY_1]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                sanitizeString(line[CONNECTIVITY_2]?.[CONNECTION_NAME]),
                line[CONNECTIVITY_2]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                line[CONNECTIVITY_1]?.[CONNECTION_POSITION] ?? null,
                line[CONNECTIVITY_2]?.[CONNECTION_POSITION] ?? null
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
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.LINE.type}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LineCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default LineCreationDialog;
