/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, EquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ADDITIONAL_PROPERTIES,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    P0,
    Q0,
} from 'components/utils/field-constants';
import React, { FC, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialogUtils';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { FORM_LOADING_DELAY, UNDEFINED_CONNECTION_DIRECTION, UNDEFINED_LOAD_TYPE } from 'components/network/constants';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import LoadCreationForm from './load-creation-form.js';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { createLoad } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    Property,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { DeepNullable } from '../../../../utils/ts-utils';

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
        [CONNECTIVITY]: getConnectivityWithPositionSchema(false),
    })
    .concat(creationPropertiesSchema)
    .required();

export type LoadCreationSchemaForm = {
    [EQUIPMENT_ID]: string;
    [EQUIPMENT_NAME]?: string;
    [LOAD_TYPE]?: string;
    [P0]: number;
    [Q0]: number;
    [CONNECTIVITY]: {
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
    };
    // Properties
    [ADDITIONAL_PROPERTIES]?: Property[];
};

const LoadCreationDialog: FC<any> = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<LoadCreationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LoadCreationSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = (load: any) => {
        reset({
            [EQUIPMENT_ID]: load.id + '(1)',
            [EQUIPMENT_NAME]: load.name ?? '',
            [LOAD_TYPE]: load.type,
            [P0]: load.p0,
            [Q0]: load.q0,
            ...getConnectivityFormData({
                voltageLevelId: load.voltageLevelId,
                busbarSectionId: load.busOrBusbarSectionId,
                busbarSectionName: undefined,
                connectionDirection: load.connectablePosition.connectionDirection,
                connectionName: load.connectablePosition.connectionName,
                connectionPosition: undefined,
                terminalConnected: undefined,
                isEquipmentModification: false,
                // terminalConnected is not copied on purpose: we use the default value (true) in all cases
            }),
            ...copyEquipmentPropertiesForCreation(load),
        });
    };

    const fromEditDataToFormValues = useCallback(
        (load: any) => {
            reset({
                [EQUIPMENT_ID]: load.equipmentId,
                [EQUIPMENT_NAME]: load.equipmentName ?? '',
                [LOAD_TYPE]: load.loadType,
                [P0]: load.p0,
                [Q0]: load.q0,
                ...getConnectivityFormData({
                    voltageLevelId: load.voltageLevelId,
                    busbarSectionId: load.busOrBusbarSectionId,
                    busbarSectionName: undefined,
                    connectionDirection: load.connectionDirection,
                    connectionName: load.connectionName,
                    connectionPosition: load.connectionPosition,
                    terminalConnected: load.terminalConnected,
                }),
                ...getPropertiesFromModification(load.properties),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data: LoadCreationSchemaForm) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.LOAD,
        operation: undefined,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (load: any) => {
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
                load.connectivity?.connectionDirection ?? UNDEFINED_CONNECTION_DIRECTION,
                sanitizeString(load.connectivity?.connectionName),
                load.connectivity?.connectionPosition ?? null,
                load.connectivity?.terminalConnected,
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
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
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
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LoadCreationForm currentNode={currentNode} studyUuid={studyUuid} />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.LOAD}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LoadCreationDialog;
