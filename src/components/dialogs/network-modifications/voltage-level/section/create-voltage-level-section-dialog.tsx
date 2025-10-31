/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY, POSITION_NEW_SECTION_SIDE } from 'components/network/constants';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ALL_BUS_BAR_SECTIONS,
    BUS_BAR_INDEX,
    BUSBAR_SECTION_ID,
    ID,
    IS_AFTER_BUSBAR_SECTION_ID,
    NEW_SWITCH_STATES,
    SWITCH_AFTER_NOT_REQUIRED,
    SWITCH_BEFORE_NOT_REQUIRED,
    SWITCHES_AFTER_SECTIONS,
    SWITCHES_BEFORE_SECTIONS,
} from '../../../../utils/field-constants';
import yup from '../../../../utils/yup-config';
import { FetchStatus } from 'services/utils';
import { EquipmentIdSelector } from 'components/dialogs/equipment-id/equipment-id-selector';
import { CreateVoltageLevelSectionForm } from './create-voltage-level-section-form';
import { BusBarSections, CreateVoltageLevelSectionDialogSchemaForm } from './voltage-level-section.type';
import { CreateVoltageLevelSectionInfos } from '../../../../../services/network-modification-types';
import { createVoltageLevelSection } from '../../../../../services/study/network-modifications';
import { fetchVoltageLevelBusBarSectionsInfos } from '../../../../../services/study/network';
import { DeepNullable } from '../../../../utils/ts-utils';
import { BusBarSectionsInfos } from '../../../../../services/study/network-map.type';

const getBusBarIndexValue = ({ busbarIndex, allBusbars }: { busbarIndex: string | null; allBusbars: boolean }) => {
    if (!busbarIndex) {
        return null;
    }
    if (allBusbars) {
        return {
            [ID]: 'all',
        };
    }
    return {
        [ID]: busbarIndex,
    };
};
const getBusBarSectionValue = ({ busbarSectionId }: { busbarSectionId: string | null }) => {
    if (!busbarSectionId) {
        return null;
    }
    return {
        [ID]: busbarSectionId,
    };
};
const emptyFormData = {
    [BUS_BAR_INDEX]: null,
    [BUSBAR_SECTION_ID]: null,
    [IS_AFTER_BUSBAR_SECTION_ID]: null,
    [SWITCHES_BEFORE_SECTIONS]: null,
    [SWITCHES_AFTER_SECTIONS]: null,
    [ALL_BUS_BAR_SECTIONS]: false,
    [NEW_SWITCH_STATES]: false,
    [SWITCH_BEFORE_NOT_REQUIRED]: false,
    [SWITCH_AFTER_NOT_REQUIRED]: false,
};

const formSchema = yup
    .object()
    .shape({
        [BUS_BAR_INDEX]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string().nullable().required(),
            }),
        [BUSBAR_SECTION_ID]: yup
            .object()
            .nullable()
            .required()
            .shape({
                [ID]: yup.string().nullable().required(),
            }),
        [IS_AFTER_BUSBAR_SECTION_ID]: yup.string().nullable().required(),
        [SWITCHES_BEFORE_SECTIONS]: yup
            .string()
            .nullable()
            .when([IS_AFTER_BUSBAR_SECTION_ID, SWITCH_BEFORE_NOT_REQUIRED], {
                is: (isAfterBusBarSectionId: string, switchBeforeNotRequired: boolean) =>
                    isAfterBusBarSectionId === POSITION_NEW_SECTION_SIDE.BEFORE.id && switchBeforeNotRequired,
                then: (schema) => schema.notRequired(),
                otherwise: (schema) => schema.required(),
            }),
        [SWITCHES_AFTER_SECTIONS]: yup
            .string()
            .nullable()
            .when([IS_AFTER_BUSBAR_SECTION_ID, SWITCH_AFTER_NOT_REQUIRED], {
                is: (isAfterBusBarSectionId: string, switchAfterNotRequired: boolean) =>
                    isAfterBusBarSectionId === POSITION_NEW_SECTION_SIDE.AFTER.id && switchAfterNotRequired,
                then: (schema) => schema.notRequired(),
                otherwise: (schema) => schema.required(),
            }),
        [ALL_BUS_BAR_SECTIONS]: yup.boolean(),
        [NEW_SWITCH_STATES]: yup.boolean(),
        [SWITCH_BEFORE_NOT_REQUIRED]: yup.boolean(),
        [SWITCH_AFTER_NOT_REQUIRED]: yup.boolean(),
    })
    .required();

export type VoltageLevelSectionCreationDialogProps = EquipmentModificationDialogProps & {
    editData?: CreateVoltageLevelSectionInfos;
};

export default function CreateVoltageLevelSectionDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    defaultIdValue,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<VoltageLevelSectionCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [isExtensionNotFoundOrNotSupportedTopology, setIsExtensionNotFoundOrNotSupportedTopology] =
        useState<boolean>(false);
    const [isSymmetricalNbBusBarSections, setIsSymmetricalNbBusBarSections] = useState<boolean>(false);
    const [busBarSectionInfos, setBusBarSectionInfos] = useState<BusBarSections>();
    const [allBusbarSectionsList, setAllBusbarSectionsList] = useState<string[]>([]);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const { snackError } = useSnackMessage();
    const formMethods = useForm<DeepNullable<CreateVoltageLevelSectionDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<CreateVoltageLevelSectionDialogSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData?.voltageLevelId) {
            setSelectedId(editData.voltageLevelId);
        }
    }, [editData]);

    const onEquipmentIdChange = useCallback(
        (voltageLevelId: string) => {
            if (voltageLevelId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchVoltageLevelBusBarSectionsInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid, voltageLevelId)
                    .then((busBarSectionsInfos: BusBarSectionsInfos) => {
                        if (busBarSectionsInfos) {
                            setBusBarSectionInfos(busBarSectionsInfos?.busBarSections || []);
                            setAllBusbarSectionsList(
                                Object.values(busBarSectionsInfos?.busBarSections || {}).flat() as string[]
                            );
                            setIsExtensionNotFoundOrNotSupportedTopology(
                                !busBarSectionsInfos.isBusbarSectionPositionFound ||
                                    busBarSectionsInfos?.topologyKind !== 'NODE_BREAKER'
                            );
                            setIsSymmetricalNbBusBarSections(busBarSectionsInfos.isSymmetrical);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const fromEditDataToFormValues = useCallback(
        (editData: CreateVoltageLevelSectionInfos) => {
            if (editData?.voltageLevelId) {
                setSelectedId(editData.voltageLevelId);
            }
            reset({
                [BUS_BAR_INDEX]:
                    getBusBarIndexValue({
                        busbarIndex: editData?.busbarIndex,
                        allBusbars: editData?.allBusbars,
                    }) ?? null,
                [ALL_BUS_BAR_SECTIONS]: editData?.allBusbars ?? false,
                [BUSBAR_SECTION_ID]: getBusBarSectionValue({ busbarSectionId: editData?.busbarSectionId }) ?? null,
                [IS_AFTER_BUSBAR_SECTION_ID]: editData?.afterBusbarSectionId
                    ? POSITION_NEW_SECTION_SIDE.AFTER.id
                    : POSITION_NEW_SECTION_SIDE.BEFORE.id,
                [SWITCHES_BEFORE_SECTIONS]: editData?.leftSwitchKind ?? null,
                [SWITCHES_AFTER_SECTIONS]: editData?.rightSwitchKind ?? null,
                [NEW_SWITCH_STATES]: editData?.switchOpen ?? false,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

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

    const findBusbarKeyForSection = useCallback(
        (sectionId: string) => {
            const infos = busBarSectionInfos as unknown as BusBarSections;
            return Object.keys(infos || {}).find((key) => infos[key]?.includes(sectionId)) || null;
        },
        [busBarSectionInfos]
    );

    const onSubmit = useCallback(
        (voltageLevelSection: CreateVoltageLevelSectionDialogSchemaForm) => {
            const voltageLevelSectionInfos = {
                type: MODIFICATION_TYPES.CREATE_VOLTAGE_LEVEL_SECTION.type,
                voltageLevelId: selectedId,
                busbarIndex: voltageLevelSection?.allBusbarSections
                    ? findBusbarKeyForSection(voltageLevelSection?.busbarSectionId?.id)
                    : voltageLevelSection?.busbarIndex?.id || null,
                busbarSectionId: voltageLevelSection?.busbarSectionId?.id || null,
                allBusbars: voltageLevelSection?.allBusbarSections || false,
                afterBusbarSectionId:
                    voltageLevelSection?.isAfterBusBarSectionId === POSITION_NEW_SECTION_SIDE.AFTER.id,
                leftSwitchKind: voltageLevelSection?.switchesBeforeSections || null,
                rightSwitchKind: voltageLevelSection?.switchesAfterSections || null,
                switchOpen: voltageLevelSection?.newSwitchStates || false,
            } satisfies CreateVoltageLevelSectionInfos;
            createVoltageLevelSection({
                voltageLevelSectionInfos: voltageLevelSectionInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelSectionCreationError',
                });
            });
        },
        [selectedId, findBusbarKeyForSection, studyUuid, currentNodeUuid, editData, snackError]
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
                onClear={clear}
                onSave={onSubmit}
                fullWidth
                maxWidth={'md'}
                titleId="CreateVoltageLevelSection"
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId != null && (
                    <CreateVoltageLevelSectionForm
                        busBarSectionInfos={busBarSectionInfos}
                        voltageLevelId={selectedId}
                        allBusbarSectionsList={allBusbarSectionsList}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        isUpdate={isUpdate}
                        isSymmetricalNbBusBarSections={isSymmetricalNbBusBarSections}
                        isNotFoundOrNotSupported={isExtensionNotFoundOrNotSupportedTopology}
                    />
                )}
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.VOLTAGE_LEVEL}
                        fillerHeight={5}
                        freeInputAllowed={false}
                        autoSelectEnabled={true}
                        autoHighlightEnabled={true}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
