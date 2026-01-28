/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    EquipmentType,
    FetchStatus,
    MODIFICATION_TYPES,
    ModificationType,
    snackWithFallback,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import yup from '../../../../utils/yup-config';
import {
    CURRENT_CONNECTION_STATUS,
    PREV_CONNECTION_STATUS,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
} from '../../../../utils/field-constants';
import { VoltageLevelTopologyModificationForm } from './voltage-level-topology-modification-form';
import { modifyVoltageLevelTopology } from '../../../../../services/study/network-modifications';
import { TopologyVoltageLevelModificationInfos } from '../../../../../services/network-modification-types';
import { fetchSwitchesOfVoltageLevel } from '../../../../../services/study/network';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { SwitchInfos } from '../../../../../services/study/network-map.type';
import { useIntl } from 'react-intl';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';

const formSchema = yup.object().shape({
    [TOPOLOGY_MODIFICATION_TABLE]: yup
        .array()
        .of(
            yup.object().shape({
                [SWITCH_ID]: yup.string(),
                [PREV_CONNECTION_STATUS]: yup.boolean().nullable(), // presents 'open'
                [CURRENT_CONNECTION_STATUS]: yup.boolean().nullable(), // presents 'close'
            })
        )
        .required(),
});

const emptyFormData = {
    [TOPOLOGY_MODIFICATION_TABLE]: [
        {
            [SWITCH_ID]: '',
            [PREV_CONNECTION_STATUS]: null,
            [CURRENT_CONNECTION_STATUS]: null,
        },
    ],
};

export type VoltageLevelTopologyModificationDialogProps = EquipmentModificationDialogProps & {
    editData: TopologyVoltageLevelModificationInfos;
};
export type VoltageLevelTopologyModificationFormSchemaType = yup.InferType<typeof formSchema>;

/**
 * Dialog to delete a list of equipment by filter.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param defaultIdValue the default line id
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
export default function VoltageLevelTopologyModificationDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    defaultIdValue,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<VoltageLevelTopologyModificationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [switchesToModify, setSwitchesToModify] = useState<SwitchInfos[]>([]);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const intl = useIntl();

    const formMethods = useFormWithDirtyTracking<VoltageLevelTopologyModificationFormSchemaType>({
        defaultValues: emptyFormData,
        resolver: yupResolver<VoltageLevelTopologyModificationFormSchemaType>(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    useEffect(() => {
        if (editData?.equipmentId) {
            setSelectedId(editData.equipmentId);
        }
    }, [editData]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (!equipmentId) {
                setSwitchesToModify([]);
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchSwitchesOfVoltageLevel(studyUuid, currentNodeUuid, currentRootNetworkUuid, equipmentId)
                    .then((switchesInfos) => {
                        if (switchesInfos.length) {
                            setSwitchesToModify(switchesInfos);
                            reset(
                                {
                                    [TOPOLOGY_MODIFICATION_TABLE]: switchesInfos?.map((row) => ({
                                        [SWITCH_ID]: row.id,
                                        [PREV_CONNECTION_STATUS]: row.open,
                                        [CURRENT_CONNECTION_STATUS]: null,
                                    })),
                                },
                                { keepDirty: true }
                            );
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        } else {
                            setSwitchesToModify([]);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        setSwitchesToModify([]);
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (topologyVLModificationInfos: VoltageLevelTopologyModificationFormSchemaType) => {
            let equipmentAttributeModificationInfos: {
                type: ModificationType;
                equipmentId: string;
                equipmentAttributeName: string;
                equipmentAttributeValue: boolean;
                equipmentType: EquipmentType;
            }[] = [];
            if (topologyVLModificationInfos[TOPOLOGY_MODIFICATION_TABLE]?.length > 0) {
                equipmentAttributeModificationInfos = topologyVLModificationInfos[TOPOLOGY_MODIFICATION_TABLE].filter(
                    (item) => {
                        return item?.currentConnectionStatus != null;
                    }
                ).map((item) => ({
                    type: MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type,
                    equipmentId: item.switchId ?? '',
                    equipmentAttributeName: 'open',
                    // Note that 'currentConnectionStatus' which presents 'close' should be inverted when submitting open attribute
                    equipmentAttributeValue: Boolean(!item.currentConnectionStatus),
                    equipmentType: EquipmentType.SWITCH,
                }));
            }
            const voltageLevelTopologyModificationInfos = {
                type: MODIFICATION_TYPES.VOLTAGE_LEVEL_TOPOLOGY_MODIFICATION.type,
                uuid: editData?.uuid,
                equipmentId: selectedId,
                equipmentAttributeModificationList: equipmentAttributeModificationInfos,
            };
            modifyVoltageLevelTopology({
                topologyVoltageLevelModificationInfos: voltageLevelTopologyModificationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'VoltageLevelTopologyModificationError' });
            });
        },
        [editData, selectedId, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const isSwitchModified = useCallback(
        (switchId: string): boolean => {
            return editData?.equipmentAttributeModificationList?.some((mod) => mod.equipmentId === switchId) ?? false;
        },
        [editData]
    );

    const mergedRowData = useMemo(() => {
        const SEPARATOR_TYPE = 'SEPARATOR';
        const SWITCH_TYPE = 'SWITCH';
        const result = [];
        const watchTable = getValues(TOPOLOGY_MODIFICATION_TABLE);
        if (watchTable?.length > 0) {
            const sortedWatchTable = [...watchTable].sort((a, b) => (a.switchId ?? '').localeCompare(b.switchId ?? ''));

            const modifiedSwitches = sortedWatchTable
                .filter((sw) => sw.switchId && isSwitchModified(sw.switchId))
                .sort((a, b) => a.switchId!.localeCompare(b.switchId!));

            const unmodifiedSwitches = sortedWatchTable
                .filter((sw) => sw.switchId && !isSwitchModified(sw.switchId))
                .sort((a, b) => a.switchId!.localeCompare(b.switchId!));

            if (modifiedSwitches.length > 0) {
                result.push({
                    type: SEPARATOR_TYPE,
                    id: 'modified-separator',
                    title:
                        intl.formatMessage({ id: 'modifiedSwitchesSeparatorTitle' }) + ` (${modifiedSwitches.length})`,
                    count: modifiedSwitches.length,
                    [SWITCH_ID]: '',
                    [PREV_CONNECTION_STATUS]: null,
                    [CURRENT_CONNECTION_STATUS]: null,
                });

                modifiedSwitches.forEach((sw) => {
                    const matchingSwitchInfos = switchesToModify?.find((attr) => attr.id === sw.switchId);
                    const matchingAttributeEditData = editData?.equipmentAttributeModificationList?.find(
                        (attr) => attr.equipmentId === sw.switchId
                    );

                    const open = isNodeBuilt(currentNode)
                        ? matchingSwitchInfos?.open
                        : (matchingAttributeEditData?.equipmentAttributeValue ?? matchingSwitchInfos?.open);

                    // Note that 'open' should be inverted when initializing CURRENT_CONNECTION_STATUS which presents 'close'
                    result.push({
                        ...sw,
                        type: SWITCH_TYPE,
                        isModified: false,
                        [CURRENT_CONNECTION_STATUS]: !open,
                    });
                    const formValues = getValues(TOPOLOGY_MODIFICATION_TABLE);
                    const index = formValues?.findIndex((item) => item.switchId === sw.switchId);
                    if (index !== -1) {
                        setValue(`${TOPOLOGY_MODIFICATION_TABLE}.${index}.${CURRENT_CONNECTION_STATUS}`, !open);
                    }
                });

                if (unmodifiedSwitches.length > 0) {
                    result.push({
                        type: SEPARATOR_TYPE,
                        id: 'unmodified-separator',
                        title:
                            intl.formatMessage({ id: 'unModifiedSwitchesSeparatorTitle' }) +
                            ` (${unmodifiedSwitches.length})`,
                        count: unmodifiedSwitches.length,
                        [SWITCH_ID]: '',
                        [PREV_CONNECTION_STATUS]: null,
                        [CURRENT_CONNECTION_STATUS]: null,
                    });

                    unmodifiedSwitches.forEach((sw) => {
                        result.push({
                            ...sw,
                            type: SWITCH_TYPE,
                            isModified: false,
                        });
                    });
                }
            } else {
                unmodifiedSwitches.forEach((sw) => {
                    result.push({
                        ...sw,
                        type: SWITCH_TYPE,
                        isModified: false,
                    });
                });
            }
            return result;
        }
        return [];
    }, [
        getValues,
        isSwitchModified,
        intl,
        switchesToModify,
        editData?.equipmentAttributeModificationList,
        currentNode,
        setValue,
    ]);

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                onClear={clear}
                fullWidth
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="ModifyVoltageLevelTopology"
                open={open}
                keepMounted={true}
                PaperProps={{
                    sx: {
                        height: '95vh',
                    },
                }}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.VOLTAGE_LEVEL}
                        fillerHeight={17}
                        freeInputAllowed={false}
                        autoSelectEnabled={true}
                        autoHighlightEnabled={true}
                    />
                )}
                {selectedId != null && (
                    <VoltageLevelTopologyModificationForm
                        currentNode={currentNode}
                        selectedId={selectedId}
                        mergedRowData={mergedRowData}
                        isUpdate={isUpdate}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
