/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
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
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { createShuntCompensator } from '../../../utils/rest-api';
import { sanitizeString } from '../dialogUtils';
import EquipmentSearchDialog from '../equipment-search-dialog';
import { useFormSearchCopy } from '../form-search-copy-hook';
import {
    UNDEFINED_CONNECTION_DIRECTION,
    FORM_LOADING_DELAY,
} from '../../network/constants';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityFormData,
    getConnectivityWithPositionValidationSchema,
} from '../connectivity/connectivity-form-utils';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormDataFromSearchCopy,
    getCharacteristicsFormValidationSchema,
} from './characteristics-pane/characteristics-form-utils';
import ShuntCompensatorCreationForm from './shunt-compensator-creation-form';
import { FetchStatus } from 'utils/rest-api';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getConnectivityWithPositionEmptyFormData(),
    ...getCharacteristicsEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getConnectivityWithPositionValidationSchema(),
        ...getCharacteristicsFormValidationSchema(),
    })
    .required();

/**
 * Dialog to create a shunt compensator in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const ShuntCompensatorCreationDialog = ({
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

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.id + '(1)',
                [EQUIPMENT_NAME]: shuntCompensator.name ?? '',
                ...getConnectivityFormData({
                    busbarSectionId: shuntCompensator.busOrBusbarSectionId,
                    connectionDirection: shuntCompensator.connectionDirection,
                    connectionName: shuntCompensator.connectionName,
                    voltageLevelId: shuntCompensator.voltageLevelId,
                }),
                ...getCharacteristicsFormDataFromSearchCopy({
                    bperSection: shuntCompensator.bperSection,
                    qatNominalV: shuntCompensator.qatNominalV,
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
                ...getConnectivityFormData({
                    busbarSectionId: shuntCompensator.busOrBusbarSectionId,
                    connectionDirection: shuntCompensator.connectionDirection,
                    connectionName: shuntCompensator.connectionName,
                    connectionPosition: shuntCompensator.connectionPosition,
                    voltageLevelId: shuntCompensator.voltageLevelId,
                }),
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

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath: 'shunt-compensators',
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type,
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
                sanitizeString(
                    shuntCompensator[CONNECTIVITY]?.[CONNECTION_NAME]
                ),
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

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-shuntCompensator"
                titleId="CreateShuntCompensator"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <ShuntCompensatorCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type}
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
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
