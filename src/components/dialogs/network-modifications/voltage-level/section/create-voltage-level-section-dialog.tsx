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
    FieldConstants,
    VoltageLevelSectionCreationForm,
    VoltageLevelSectionCreationFormData,
    voltageLevelSectionCreationFormSchema,
    voltageLevelSectionCreationEmptyFormData,
    VoltageLevelSectionCreationDto,
    voltageLevelSectionCreationDtoToForm,
    voltageLevelSectionCreationFormToDto,
    BusBarSections,
} from '@gridsuite/commons-ui';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchStatus } from 'services/utils';
import { EquipmentIdSelector } from 'components/dialogs/equipment-id/equipment-id-selector';
import { createVoltageLevelSection } from '../../../../../services/study/network-modifications';
import { fetchVoltageLevelBusBarSectionsInfos } from '../../../../../services/study/network';
import { BusBarSectionsInfos } from '../../../../../services/study/network-map.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

export type VoltageLevelSectionCreationDialogProps = EquipmentModificationDialogProps & {
    editData?: VoltageLevelSectionCreationDto;
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
    const formMethods = useForm<DeepNullable<VoltageLevelSectionCreationFormData>>({
        defaultValues: voltageLevelSectionCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<VoltageLevelSectionCreationFormData>>(voltageLevelSectionCreationFormSchema),
    });

    const { reset, setValue } = formMethods;

    useEffect(() => {
        if (editData?.voltageLevelId) {
            setSelectedId(editData.voltageLevelId);
        }
    }, [editData]);

    // keep the form's voltage level id in sync with the id picked through the equipment selector
    useEffect(() => {
        if (selectedId) {
            setValue(FieldConstants.EQUIPMENT_ID, selectedId);
        }
    }, [selectedId, setValue]);

    const onEquipmentIdChange = useCallback(
        (voltageLevelId: string) => {
            if (voltageLevelId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchVoltageLevelBusBarSectionsInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid, voltageLevelId)
                    .then((busBarSectionsInfos: BusBarSectionsInfos) => {
                        if (busBarSectionsInfos) {
                            setBusBarSectionInfos(busBarSectionsInfos?.busBarSections || []);
                            setAllBusbarSectionsList(Object.values(busBarSectionsInfos?.busBarSections || {}).flat());
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

    useEffect(() => {
        if (editData) {
            reset(voltageLevelSectionCreationDtoToForm(editData));
        }
    }, [editData, reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        reset(voltageLevelSectionCreationEmptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (voltageLevelSection: VoltageLevelSectionCreationFormData) => {
            const voltageLevelSectionInfos = voltageLevelSectionCreationFormToDto(
                voltageLevelSection,
                busBarSectionInfos
            );
            createVoltageLevelSection({
                voltageLevelSectionInfos: voltageLevelSectionInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'VoltageLevelSectionCreationError' });
            });
        },
        [busBarSectionInfos, studyUuid, currentNodeUuid, editData, snackError]
    );

    return (
        <CustomFormProvider
            validationSchema={voltageLevelSectionCreationFormSchema}
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
                    <VoltageLevelSectionCreationForm
                        busBarSectionInfos={busBarSectionInfos}
                        allBusbarSectionsList={allBusbarSectionsList}
                        isSymmetricalNbBusBarSections={isSymmetricalNbBusBarSections}
                        isNotFoundOrNotSupported={isExtensionNotFoundOrNotSupportedTopology}
                        PositionDiagramPane={PositionDiagramPane}
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
