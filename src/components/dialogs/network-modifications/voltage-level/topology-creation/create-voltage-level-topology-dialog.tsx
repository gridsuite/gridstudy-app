/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SECTION_COUNT, SWITCH_KIND, SWITCH_KINDS, SWITCHES_BETWEEN_SECTIONS } from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CustomFormProvider,
    EquipmentType,
    MODIFICATION_TYPES,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
} from '@gridsuite/commons-ui';
import yup from '../../../../utils/yup-config';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { CreateVoltageLevelTopologyDialogSchemaForm } from './create-voltage-level-topology-dialog.type';
import CreateVoltageLevelTopologyForm from './create-voltage-level-topology-form';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { createVoltageLevelTopology } from '../../../../../services/study/network-modifications';
import { CreateVoltageLevelTopologyInfos } from '../../../../../services/network-modification-types';
import { FetchStatus } from '../../../../../services/utils';
import { useIntl } from 'react-intl';

const emptyFormData = {
    [SECTION_COUNT]: null,
    [SWITCHES_BETWEEN_SECTIONS]: '',
    [SWITCH_KINDS]: [],
};
const formSchema = yup.object().shape({
    [SECTION_COUNT]: yup.number().required().nullable().min(1, 'AtLeastOneSectionAdded'),
    [SWITCHES_BETWEEN_SECTIONS]: yup
        .string()
        .nullable()
        .when([SECTION_COUNT], {
            is: (sectionCount: number) => sectionCount > 1,
            then: (schema) => schema.required(),
        }),
    [SWITCH_KINDS]: yup.array().nullable(),
});
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
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<CreateVoltageLevelTopologyDialogSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData?.voltageLevelId) {
                setSelectedId(editData.voltageLevelId);
            }
            const switchKinds =
                editData.switchKinds?.map((switchKind) => ({
                    [SWITCH_KIND]: switchKind,
                })) || [];
            const switchesBetweenSections =
                editData.switchKinds?.map((switchKind) => intl.formatMessage({ id: switchKind })).join(' / ') || '';

            reset({
                [SECTION_COUNT]: editData?.sectionCount ?? null,
                [SWITCHES_BETWEEN_SECTIONS]: switchesBetweenSections,
                [SWITCH_KINDS]: switchKinds,
            });
        }
    }, [editData, reset, intl]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const onSubmit = useCallback(
        (voltageLevelTopology: CreateVoltageLevelTopologyDialogSchemaForm) => {
            const createVoltageLevelTopologyInfos = {
                type: MODIFICATION_TYPES.CREATE_VOLTAGE_LEVEL_TOPOLOGY.type,
                voltageLevelId: selectedId,
                sectionCount: voltageLevelTopology[SECTION_COUNT],
                switchKinds: voltageLevelTopology[SWITCH_KINDS]?.map((e) => {
                    return e.switchKind;
                }),
            } satisfies CreateVoltageLevelTopologyInfos;
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
            validationSchema={formSchema}
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
                        studyUuid={studyUuid}
                        voltageLevelId={selectedId}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
