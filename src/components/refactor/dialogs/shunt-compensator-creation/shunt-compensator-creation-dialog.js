/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAXIMUM_NUMBER_OF_SECTIONS,
    CURRENT_NUMBER_OF_SECTIONS,
    IDENTICAL_SECTIONS,
    SUSCEPTANCE_PER_SECTION,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
    createShuntCompensator,
    fetchEquipmentInfos,
} from '../../../../utils/rest-api';
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
import ShuntCompensatorCreationForm from './shunt-compensator-creation-form';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_NUMBER_OF_SECTIONS]: 1,
    [CURRENT_NUMBER_OF_SECTIONS]: 0,
    [IDENTICAL_SECTIONS]: false,
    [SUSCEPTANCE_PER_SECTION]: null,
    ...getConnectivityEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [MAXIMUM_NUMBER_OF_SECTIONS]: yup
            .number()
            .moreThan(0, 'ShuntCompensatorErrorMaximumLessThanOne')
            .required(),
        [CURRENT_NUMBER_OF_SECTIONS]: yup
            .number()
            .moreThan(-1, 'ShuntCompensatorErrorCurrentLessThanMaximum')
            .max(
                yup.ref(MAXIMUM_NUMBER_OF_SECTIONS),
                'ShuntCompensatorErrorCurrentLessThanMaximum'
            )
            .required(),
        [IDENTICAL_SECTIONS]: yup.bool().required(),
        [SUSCEPTANCE_PER_SECTION]: yup.number().nullable().required(),
        ...getConnectivityFormValidationSchema(),
    })
    .required();

/**
 * Dialog to create a shunt compensator in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid the node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const ShuntCompensatorCreationDialog = ({
    voltageLevelOptionsPromise,
    currentNodeUuid,
    editData,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'shunt-compensators';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromSearchCopyToFormValues = (shuntCompensator) => {
        fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            'voltage-levels',
            shuntCompensator.voltageLevelId,
            true
        ).then((vlResult) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.id + '(1)',
                [EQUIPMENT_NAME]: shuntCompensator.name ?? '',
                [MAXIMUM_NUMBER_OF_SECTIONS]:
                    shuntCompensator.maximumSectionCount,
                [CURRENT_NUMBER_OF_SECTIONS]: shuntCompensator.sectionCount,
                [SUSCEPTANCE_PER_SECTION]: shuntCompensator.bperSection,
                ...getConnectivityFormData({
                    voltageLevelId: shuntCompensator.voltageLevelId,
                    voltageLevelTopologyKind: vlResult.topologyKind,
                    voltageLevelName: vlResult.name,
                    voltageLevelNominalVoltage: vlResult.nominalVoltage,
                    voltageLevelSubstationId: vlResult.substationId,
                    connectionDirection: shuntCompensator.connectionDirection,
                    connectionName: shuntCompensator.connectionName,
                    connectionPosition: shuntCompensator.connectionPosition,
                }),
            });
        });
    };

    const fromEditDataToFormValues = useCallback(
        (shuntCompensator) => {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'voltage-levels',
                shuntCompensator.voltageLevelId,
                true
            )
                .then((vlResult) => {
                    reset({
                        [EQUIPMENT_ID]: shuntCompensator.equipmentId,
                        [EQUIPMENT_NAME]: shuntCompensator.equipmentName ?? '',
                        [MAXIMUM_NUMBER_OF_SECTIONS]:
                            shuntCompensator.maximumNumberOfSections,
                        [CURRENT_NUMBER_OF_SECTIONS]:
                            shuntCompensator.currentNumberOfSections,
                        [IDENTICAL_SECTIONS]:
                            shuntCompensator.isIdenticalSection,
                        [SUSCEPTANCE_PER_SECTION]:
                            shuntCompensator.susceptancePerSection,
                        ...getConnectivityFormData({
                            voltageLevelId: shuntCompensator.voltageLevelId,
                            voltageLevelTopologyKind: vlResult.topologyKind,
                            voltageLevelName: vlResult.name,
                            voltageLevelNominalVoltage: vlResult.nominalVoltage,
                            voltageLevelSubstationId: vlResult.substationId,
                            busbarSectionId:
                                shuntCompensator.busOrBusbarSectionId,
                            connectionDirection:
                                shuntCompensator.connectionDirection,
                            connectionName: shuntCompensator.connectionName,
                            connectionPosition:
                                shuntCompensator.connectionPosition,
                        }),
                    });
                }) // if voltage level can't be found, we fill the form with minimal infos
                .catch(() => {
                    reset({
                        [EQUIPMENT_ID]: shuntCompensator.equipmentId,
                        [EQUIPMENT_NAME]: shuntCompensator.equipmentName ?? '',
                        [MAXIMUM_NUMBER_OF_SECTIONS]:
                            shuntCompensator.maximumNumberOfSections,
                        [CURRENT_NUMBER_OF_SECTIONS]:
                            shuntCompensator.currentNumberOfSections,
                        [IDENTICAL_SECTIONS]:
                            shuntCompensator.isIdenticalSection,
                        [SUSCEPTANCE_PER_SECTION]:
                            shuntCompensator.susceptancePerSection,
                        ...getConnectivityFormData({
                            voltageLevelId: shuntCompensator.voltageLevelId,
                            busbarSectionId:
                                shuntCompensator.busOrBusbarSectionId,
                            connectionDirection:
                                shuntCompensator.connectionDirection,
                            connectionName: shuntCompensator.connectionName,
                            connectionPosition:
                                shuntCompensator.connectionPosition,
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
        (shuntCompensator) => {
            createShuntCompensator(
                studyUuid,
                currentNodeUuid,
                shuntCompensator[EQUIPMENT_ID],
                sanitizeString(shuntCompensator[EQUIPMENT_NAME]),
                shuntCompensator[MAXIMUM_NUMBER_OF_SECTIONS],
                shuntCompensator[CURRENT_NUMBER_OF_SECTIONS],
                shuntCompensator[IDENTICAL_SECTIONS],
                shuntCompensator[SUSCEPTANCE_PER_SECTION],
                shuntCompensator.connectivity,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                shuntCompensator.connectivity?.connectionDirection ??
                    UNDEFINED_CONNECTION_DIRECTION,
                shuntCompensator?.connectivity?.connectionName ?? null,
                shuntCompensator?.connectivity?.connectionPosition ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShuntCompensatorCreationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-shuntCompensator"
                titleId="CreateShuntCompensator"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <ShuntCompensatorCreationForm
                    voltageLevelOptionsPromise={voltageLevelOptionsPromise}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'SHUNT_COMPENSATOR'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

ShuntCompensatorCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
