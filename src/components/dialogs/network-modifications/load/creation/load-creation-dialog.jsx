/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    P0,
    Q0,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialogUtils';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import {
    FORM_LOADING_DELAY,
    UNDEFINED_CONNECTION_DIRECTION,
    UNDEFINED_LOAD_TYPE,
} from 'components/network/constants';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import LoadCreationForm from './load-creation-form';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { createLoad } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [LOAD_TYPE]: null,
    [P0]: null,
    [Q0]: null,
    ...getConnectivityWithPositionEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [LOAD_TYPE]: yup.string().nullable(),
        [P0]: yup.number().nullable().required(),
        [Q0]: yup.number().nullable().required(),
        ...getConnectivityWithPositionValidationSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

const LoadCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
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

    const fromSearchCopyToFormValues = (load) => {
        reset({
            [EQUIPMENT_ID]: load.id + '(1)',
            [EQUIPMENT_NAME]: load.name ?? '',
            [LOAD_TYPE]: load.type,
            [P0]: load.p0,
            [Q0]: load.q0,
            ...getConnectivityFormData({
                voltageLevelId: load.voltageLevelId,
                busbarSectionId: load.busOrBusbarSectionId,
                connectionDirection:
                    load.connectablePosition.connectionDirection,
                connectionName: load.connectablePosition.connectionName,
                // connected is not copied on purpose: we use the default value (true) in all cases
            }),
            ...copyEquipmentPropertiesForCreation(load),
        });
    };

    const fromEditDataToFormValues = useCallback(
        (load) => {
            reset({
                [EQUIPMENT_ID]: load.equipmentId,
                [EQUIPMENT_NAME]: load.equipmentName ?? '',
                [LOAD_TYPE]: load.loadType,
                [P0]: load.p0,
                [Q0]: load.q0,
                ...getConnectivityFormData({
                    voltageLevelId: load.voltageLevelId,
                    busbarSectionId: load.busOrBusbarSectionId,
                    connectionDirection: load.connectionDirection,
                    connectionName: load.connectionName,
                    connectionPosition: load.connectionPosition,
                    connected: load.connected,
                }),
                ...getPropertiesFromModification(load.properties),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.LOAD,
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
                !load[LOAD_TYPE] ? UNDEFINED_LOAD_TYPE : load[LOAD_TYPE],
                load[P0],
                load[Q0],
                load.connectivity.voltageLevel.id,
                load.connectivity.busOrBusbarSection.id,
                !!editData,
                editData ? editData.uuid : undefined,
                load.connectivity?.connectionDirection ??
                    UNDEFINED_CONNECTION_DIRECTION,
                sanitizeString(load.connectivity?.connectionName),
                load.connectivity?.connectionPosition ?? null,
                load.connectivity?.connected,
                toModificationProperties(load)
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

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-load"
                maxWidth={'md'}
                titleId="CreateLoad"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <LoadCreationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.LOAD}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

LoadCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
};

export default LoadCreationDialog;
