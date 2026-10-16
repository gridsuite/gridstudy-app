/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    getCharacteristicsCreateFormDataFromSearchCopy,
    getConnectivityFormData,
    ShuntCompensatorCreationDto,
    shuntCompensatorCreationDtoToForm,
    shuntCompensatorCreationEmptyFormData,
    ShuntCompensatorCreationForm,
    ShuntCompensatorCreationFormData,
    shuntCompensatorCreationFormSchema,
    shuntCompensatorCreationFormToDto,
    ShuntCompensatorFormInfos,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { createShuntCompensator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';

export type ShuntCompensatorCreationDialogProps = NetworkModificationDialogProps & {
    editData: ShuntCompensatorCreationDto;
};

/**
 * Dialog to create a shunt compensator in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
export default function ShuntCompensatorCreationDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<ShuntCompensatorCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;

    const { snackError, snackWarning } = useSnackMessage();

    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

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

    const formMethods = useForm<DeepNullable<ShuntCompensatorCreationFormData>>({
        defaultValues: shuntCompensatorCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<ShuntCompensatorCreationFormData>>(shuntCompensatorCreationFormSchema),
    });

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = useCallback(
        (shuntCompensator: ShuntCompensatorFormInfos) => {
            reset(
                {
                    [FieldConstants.EQUIPMENT_ID]: `${shuntCompensator.id}(1)`,
                    [FieldConstants.EQUIPMENT_NAME]: shuntCompensator.name ?? '',
                    ...getConnectivityFormData({
                        busbarSectionId: shuntCompensator.busOrBusbarSectionId,
                        connectionDirection: shuntCompensator.connectablePosition.connectionDirection,
                        connectionName: shuntCompensator.connectablePosition.connectionName,
                        voltageLevelId: shuntCompensator.voltageLevelId,
                        // terminalConnected is not copied on purpose: we use the default value (true) in all cases
                    }),
                    ...getCharacteristicsCreateFormDataFromSearchCopy({
                        bPerSection: shuntCompensator.bPerSection ?? null,
                        qAtNominalV: shuntCompensator.qAtNominalV ?? null,
                        sectionCount: shuntCompensator.sectionCount,
                        maximumSectionCount: shuntCompensator.maximumSectionCount,
                    }),
                    ...copyEquipmentPropertiesForCreation(shuntCompensator),
                },
                { keepDefaultValues: true }
            );
            if (!shuntCompensator.isLinear) {
                snackWarning({
                    headerId: 'partialCopyShuntCompensator',
                });
            }
        },
        [reset, snackWarning]
    );

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.SHUNT_COMPENSATOR);

    useEffect(() => {
        if (editData) {
            reset(shuntCompensatorCreationDtoToForm(editData));
        }
    }, [reset, editData]);

    const onSubmit = useCallback(
        (shuntCompensator: ShuntCompensatorCreationFormData) => {
            const dto = shuntCompensatorCreationFormToDto(shuntCompensator);
            createShuntCompensator({
                shuntCompensatorCreationInfos: dto,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'ShuntCompensatorCreationError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(shuntCompensatorCreationEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={shuntCompensatorCreationFormSchema}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="CreateShuntCompensator"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <ShuntCompensatorCreationForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.SHUNT_COMPENSATOR}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
