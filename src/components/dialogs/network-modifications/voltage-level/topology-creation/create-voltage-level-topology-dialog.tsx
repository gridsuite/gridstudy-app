/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    EquipmentType,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
    CreateVoltageLevelTopologyForm,
    createVoltageLevelTopologyFormSchema,
    createVoltageLevelTopologyEmptyFormData,
    createVoltageLevelTopologyDtoToForm,
    createVoltageLevelTopologyFormToDto,
    CreateVoltageLevelTopologyInfos,
    CreateVoltageLevelTopologyDialogSchemaForm,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { createVoltageLevelTopology } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { useIntl } from 'react-intl';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

export type CreateVoltageLevelTopologyDialogProps = EquipmentModificationDialogProps & {
    editData?: CreateVoltageLevelTopologyInfos;
};
export default function CreateVoltageLevelTopologyDialog({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<CreateVoltageLevelTopologyDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);

    const formMethods = useForm<DeepNullable<CreateVoltageLevelTopologyDialogSchemaForm>>({
        defaultValues: createVoltageLevelTopologyEmptyFormData,
        resolver: yupResolver<DeepNullable<CreateVoltageLevelTopologyDialogSchemaForm>>(
            createVoltageLevelTopologyFormSchema
        ),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData?.voltageLevelId) {
                setSelectedId(editData.voltageLevelId);
            }
            reset(createVoltageLevelTopologyDtoToForm(editData, intl));
        }
    }, [editData, reset, intl]);

    const clear = useCallback(() => {
        reset(createVoltageLevelTopologyEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const onSubmit = useCallback(
        (voltageLevelTopology: CreateVoltageLevelTopologyDialogSchemaForm) => {
            const createVoltageLevelTopologyInfos = createVoltageLevelTopologyFormToDto(
                voltageLevelTopology,
                selectedId
            );
            createVoltageLevelTopology({
                createVoltageLevelTopologyInfos: createVoltageLevelTopologyInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'CreateVoltageLevelTopologyError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError, selectedId]
    );

    return (
        <CustomFormProvider
            validationSchema={createVoltageLevelTopologyFormSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                open={open}
                titleId={'CreateVoltageLevelTopology'}
                keepMounted={true}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                PaperProps={{ sx: { height: '75vh' } }}
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.VOLTAGE_LEVEL}
                        fillerHeight={4}
                    />
                )}
                {selectedId != null && (
                    <CreateVoltageLevelTopologyForm
                        voltageLevelId={selectedId}
                        PositionDiagramPane={PositionDiagramPane}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
