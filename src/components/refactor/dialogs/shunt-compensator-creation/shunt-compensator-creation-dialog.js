/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EQUIPMENT_TYPE, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAXIMUM_NUMBER_OF_SECTIONS,
    CURRENT_NUMBER_OF_SECTIONS,
    IDENTICAL_SECTIONS,
    SUSCEPTANCE_PER_SECTION,
    CONNECTIVITY,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_TYPE,
    SHUNT_COMPENSATOR_TYPES,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { createShuntCompensator } from '../../../../utils/rest-api';
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
    [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [SUSCEPTANCE_PER_SECTION]: null,
    [SHUNT_COMPENSATOR_TYPE]: '',
    [Q_AT_NOMINAL_V]: null,
    ...getConnectivityEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [CHARACTERISTICS_CHOICE]: yup.string().required(),
        [SUSCEPTANCE_PER_SECTION]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (reactivePowerControl) =>
                    reactivePowerControl ===
                    CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
                then: (schema) => schema.required(),
            }),
        [SHUNT_COMPENSATOR_TYPE]: yup.string().when([CHARACTERISTICS_CHOICE], {
            is: (reactivePowerControl) =>
                reactivePowerControl ===
                CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
            then: (schema) =>
                schema
                    .oneOf([
                        SHUNT_COMPENSATOR_TYPES.CAPACITOR.id,
                        SHUNT_COMPENSATOR_TYPES.REACTOR.id,
                    ])
                    .required(),
        }),
        [Q_AT_NOMINAL_V]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (reactivePowerControl) =>
                    reactivePowerControl ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
                then: (schema) =>
                    schema
                        .min(
                            0,
                            'ShuntCompensatorErrorQAtNominalVoltageLessThanZero'
                        )
                        .required(),
            }),
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

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromSearchCopyToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.id + '(1)',
                [EQUIPMENT_NAME]: shuntCompensator.name ?? '',
                [MAXIMUM_NUMBER_OF_SECTIONS]:
                    shuntCompensator.maximumSectionCount,
                [CURRENT_NUMBER_OF_SECTIONS]: shuntCompensator.sectionCount,
                [SUSCEPTANCE_PER_SECTION]: shuntCompensator.bperSection,
                [Q_AT_NOMINAL_V]: shuntCompensator.qatNominalV,
                [CHARACTERISTICS_CHOICE]:
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
                [SHUNT_COMPENSATOR_TYPE]:
                    shuntCompensator.bperSection > 0
                        ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
                        : SHUNT_COMPENSATOR_TYPES.REACTOR.id,
                ...getConnectivityFormData({
                    busbarSectionId: shuntCompensator.busOrBusbarSectionId,
                    connectionDirection: shuntCompensator.connectionDirection,
                    connectionName: shuntCompensator.connectionName,
                    connectionPosition: shuntCompensator.connectionPosition,
                    voltageLevelId: shuntCompensator.voltageLevelId,
                }),
            });
        },
        [reset]
    );

    const fromEditDataToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.equipmentId,
                [EQUIPMENT_NAME]: shuntCompensator.equipmentName ?? '',
                [MAXIMUM_NUMBER_OF_SECTIONS]:
                    shuntCompensator.maximumNumberOfSections,
                [CURRENT_NUMBER_OF_SECTIONS]:
                    shuntCompensator.currentNumberOfSections,
                [IDENTICAL_SECTIONS]: shuntCompensator.isIdenticalSection,
                [SUSCEPTANCE_PER_SECTION]:
                    shuntCompensator.susceptancePerSection,
                [Q_AT_NOMINAL_V]: shuntCompensator.qAtNominalV,
                [SHUNT_COMPENSATOR_TYPE]: shuntCompensator.shuntCompensatorType,
                [CHARACTERISTICS_CHOICE]: shuntCompensator.qAtNominalV
                    ? CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    : CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
                ...getConnectivityFormData({
                    busbarSectionId: shuntCompensator.busOrBusbarSectionId,
                    connectionDirection: shuntCompensator.connectionDirection,
                    connectionName: shuntCompensator.connectionName,
                    connectionPosition: shuntCompensator.connectionPosition,
                    voltageLevelId: shuntCompensator.voltageLevelId,
                }),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath: 'shunt-compensators',
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
                shuntCompensator[MAXIMUM_NUMBER_OF_SECTIONS] ?? 1,
                shuntCompensator[CURRENT_NUMBER_OF_SECTIONS] ?? 1,
                shuntCompensator[IDENTICAL_SECTIONS] ?? true,
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
                shuntCompensator[CONNECTIVITY],
                editData ? true : false,
                editData ? editData.uuid : undefined,
                shuntCompensator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                shuntCompensator[CONNECTIVITY]?.[CONNECTION_NAME] ?? null,
                shuntCompensator[CONNECTIVITY]?.[CONNECTION_POSITION] ?? null
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
                    equipmentType={EQUIPMENT_TYPE.SHUNT_COMPENSATOR.name}
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
