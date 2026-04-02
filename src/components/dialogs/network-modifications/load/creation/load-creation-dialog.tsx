/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    EquipmentType,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
    LoadCreationDto,
    loadCreationEmptyFormData,
    LoadCreationFormData,
    loadCreationFormSchema,
    loadCreationDtoToForm,
    LoadForm,
    getConnectivityFormData,
    LoadFormInfos,
    loadCreationFormToDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER_SETPOINT,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER_SET_POINT,
} from 'components/utils/field-constants';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';

import { createLoad } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils.type';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import useVoltageLevelsListInfos from 'hooks/use-voltage-levels-list-infos';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';
import { WithModificationId } from '../../../../../services/network-modification-types';

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

interface LoadCreationDtoWithId extends LoadCreationDto, WithModificationId {}

export type LoadCreationDialogProps = NetworkModificationDialogProps & {
    editData: LoadCreationDtoWithId;
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
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<LoadCreationFormData>>({
        defaultValues: loadCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<LoadCreationFormData>>(loadCreationFormSchema),
    });

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = (load: LoadFormInfos) => ({
        equipmentID: load.id + '(1)',
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

    const searchCopy = useFormSearchCopy((data) => {
        reset(fromSearchCopyToFormValues(data), { keepDefaultValues: true });
    }, EquipmentType.LOAD);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    useEffect(() => {
        if (editData) {
            reset(loadCreationDtoToForm(editData));
        }
    }, [reset, editData]);

    const onSubmit = useCallback(
        (loadForm: LoadCreationFormData) => {
            const dto = loadCreationFormToDto(loadForm);
            createLoad(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'LoadCreationError' });
            });
        },
        [editData?.uuid, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => reset(loadCreationEmptyFormData), [reset]);

    return (
        <CustomFormProvider
            validationSchema={loadCreationFormSchema}
            isNodeBuilt={isNodeBuilt(currentNode)}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="CreateLoad"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LoadForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.LOAD}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
