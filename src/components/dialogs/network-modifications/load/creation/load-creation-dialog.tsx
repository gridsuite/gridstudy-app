/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    EquipmentSearchDialog,
    EquipmentType,
    FetchStatus,
    ModificationDialog,
    snackWithFallback,
    useFormSearchCopy,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER_SET_POINT,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialog-utils';
import { FORM_LOADING_DELAY, UNDEFINED_CONNECTION_DIRECTION, UNDEFINED_LOAD_TYPE } from 'components/network/constants';
import yup from 'components/utils/yup-config';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import { createLoad } from '../../../../../services/study/network-modifications';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { DeepNullable } from '../../../../utils/ts-utils';
import { LoadCreationInfos, LoadCreationSchemaForm } from './load-creation.type';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import LoadDialogHeader from '../common/load-dialog-header';
import { LoadDialogTab } from '../common/load-utils';
import LoadDialogTabsContent from '../common/load-dialog-tabs-content';
import { LoadFormInfos } from '../common/load.type';
import useVoltageLevelsListInfos from 'hooks/use-voltage-levels-list-infos';
import { useStudyContext } from '../../../../../hooks/use-study-context';

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
    [ACTIVE_POWER_SETPOINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getConnectivityWithPositionEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [LOAD_TYPE]: yup.string().nullable(),
        [ACTIVE_POWER_SETPOINT]: yup.number().nullable().required(),
        [REACTIVE_POWER_SET_POINT]: yup.number().nullable().required(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(false),
    })
    .concat(creationPropertiesSchema)
    .required();

export type LoadCreationDialogProps = NetworkModificationDialogProps & {
    editData: LoadCreationInfos;
};

export function LoadCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LoadCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const [tabIndex, setTabIndex] = useState<number>(LoadDialogTab.CONNECTIVITY_TAB);
    const studyContext = useStudyContext();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<LoadCreationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LoadCreationSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = (load: LoadFormInfos) => ({
        [EQUIPMENT_ID]: load.id + '(1)',
        [EQUIPMENT_NAME]: load.name ?? '',
        [LOAD_TYPE]: load.type,
        [ACTIVE_POWER_SETPOINT]: load.p0,
        [REACTIVE_POWER_SET_POINT]: load.q0,
        ...getConnectivityFormData({
            voltageLevelId: load.voltageLevelId,
            busbarSectionId: load.busOrBusbarSectionId,
            connectionDirection: load.connectablePosition.connectionDirection,
            connectionName: load.connectablePosition.connectionName,
            connectionPosition: undefined,
            terminalConnected: undefined,
            isEquipmentModification: false,
            // terminalConnected is not copied on purpose: we use the default value (true) in all cases
        }),
        ...copyEquipmentPropertiesForCreation({ properties: load.properties }),
    });

    const fromEditDataToFormValues = useCallback(
        (load: LoadCreationInfos) => {
            reset({
                [EQUIPMENT_ID]: load.equipmentId,
                [EQUIPMENT_NAME]: load.equipmentName ?? '',
                [LOAD_TYPE]: load.loadType,
                [ACTIVE_POWER_SETPOINT]: load.p0,
                [REACTIVE_POWER_SET_POINT]: load.q0,
                ...getConnectivityFormData({
                    voltageLevelId: load.voltageLevelId,
                    busbarSectionId: load.busOrBusbarSectionId,
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

    const searchCopy = useFormSearchCopy(
        (data) => {
            reset(fromSearchCopyToFormValues(data), { keepDefaultValues: true });
        },
        EquipmentType.LOAD,
        studyContext
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (load: LoadCreationSchemaForm) => {
            createLoad({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                id: load[EQUIPMENT_ID],
                name: sanitizeString(load[EQUIPMENT_NAME]),
                loadType: load[LOAD_TYPE] ?? UNDEFINED_LOAD_TYPE,
                p0: load[ACTIVE_POWER_SETPOINT],
                q0: load[REACTIVE_POWER_SET_POINT],
                voltageLevelId: load.connectivity.voltageLevel.id,
                busOrBusbarSectionId: load.connectivity.busOrBusbarSection.id,
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
                connectionDirection: load.connectivity?.connectionDirection ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName: sanitizeString(load.connectivity?.connectionName),
                connectionPosition: load.connectivity?.connectionPosition ?? null,
                terminalConnected: load.connectivity?.terminalConnected,
                properties: toModificationProperties(load),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LoadCreationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => reset(emptyFormData), [reset]);

    const onValidationError = (errors: FieldErrors) => {
        let tabsInError: number[] = [];
        if (
            errors?.[ACTIVE_POWER_SETPOINT] !== undefined ||
            errors?.[REACTIVE_POWER_SET_POINT] !== undefined ||
            errors?.[ADDITIONAL_PROPERTIES] !== undefined
        ) {
            tabsInError.push(LoadDialogTab.CHARACTERISTICS_TAB);
        }
        if (errors?.[CONNECTIVITY] !== undefined) {
            tabsInError.push(LoadDialogTab.CONNECTIVITY_TAB);
        }
        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }
        setTabIndexesWithError(tabsInError);
    };

    const headerAndTabs = (
        <LoadDialogHeader tabIndexesWithError={tabIndexesWithError} tabIndex={tabIndex} setTabIndex={setTabIndex} />
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                onValidationError={onValidationError}
                subtitle={headerAndTabs}
                maxWidth={'md'}
                titleId="CreateLoad"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LoadDialogTabsContent
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    tabIndex={tabIndex}
                    voltageLevelOptions={voltageLevelOptions}
                />
                {studyContext && (
                    <EquipmentSearchDialog
                        open={searchCopy.isDialogSearchOpen}
                        onClose={searchCopy.handleCloseSearchDialog}
                        equipmentType={EquipmentType.LOAD}
                        onSelectionChange={searchCopy.handleSelectionChange}
                        studyContext={studyContext}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
