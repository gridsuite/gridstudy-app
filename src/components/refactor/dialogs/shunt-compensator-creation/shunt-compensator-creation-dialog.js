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
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
    [MAXIMUM_NUMBER_OF_SECTIONS]: 1,
    [CURRENT_NUMBER_OF_SECTIONS]: 0,
    [IDENTICAL_SECTIONS]: true,
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
            .min(1, 'ShuntCompensatorErrorMaximumLessThanOne')
            .required(),
        [CURRENT_NUMBER_OF_SECTIONS]: yup
            .number()
            .min(0, 'ShuntCompensatorErrorCurrentLessThanZero')
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
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const ShuntCompensatorCreationDialog = ({
    studyUuid,
    currentNode,
    editData,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

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
        currentNodeUuid: currentNode?.id,
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
                shuntCompensator[MAXIMUM_NUMBER_OF_SECTIONS],
                shuntCompensator[CURRENT_NUMBER_OF_SECTIONS],
                shuntCompensator[IDENTICAL_SECTIONS],
                shuntCompensator[SUSCEPTANCE_PER_SECTION],
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
                    studyUuid={studyUuid}
                    currentNode={currentNode}
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
    studyUuid: PropTypes.string,
    currentNode: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
