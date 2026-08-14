/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    computeQ0,
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    getConnectivityFormData,
    getReactiveFormData,
    getStandbyAutomatonFormData,
    REGULATION_TYPES,
    snackWithFallback,
    staticVarCompensatorCreationEmptyFormData,
    StaticVarCompensatorCreationForm,
    StaticVarCompensatorCreationFormData,
    staticVarCompensatorCreationFormSchema,
    staticVarCompensatorCreationFormToDto,
    StaticVarCompensatorDto,
    staticVarCompensatorDtoToForm,
    StaticVarCompensatorFormInfo,
    useSnackMessage,
    VOLTAGE_REGULATION_MODES,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { createStaticVarCompensator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { fetchVoltageLevelEquipments } from '../../../../../services/study/network-map';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';

type StaticVarCompensatorCreationDialogProps = NetworkModificationDialogProps & {
    editData: StaticVarCompensatorDto;
};

/**
 * Dialog to create a static var compensator in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
export default function StaticVarCompensatorCreationDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<StaticVarCompensatorCreationDialogProps>) {
    const currentNodeUuid = currentNode.id;

    const { snackError } = useSnackMessage();

    const fetchVoltageLevelEquipmentsCallback = useCallback(
        (voltageLevelId: string) =>
            fetchVoltageLevelEquipments(studyUuid, currentNode.id, currentRootNetworkUuid, voltageLevelId, true),
        [studyUuid, currentNode.id, currentRootNetworkUuid]
    );
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id, currentRootNetworkUuid);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNode.id, currentRootNetworkUuid]
    );

    const formMethods = useForm<DeepNullable<StaticVarCompensatorCreationFormData>>({
        defaultValues: staticVarCompensatorCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<StaticVarCompensatorCreationFormData>>(
            staticVarCompensatorCreationFormSchema
        ),
    });

    const { reset } = formMethods;
    const fromSearchCopyToFormValues = useCallback(
        (staticCompensator: StaticVarCompensatorFormInfo) => {
            reset(
                {
                    equipmentID: staticCompensator.id + '(1)',
                    [FieldConstants.EQUIPMENT_NAME]: staticCompensator.name ?? '',
                    ...getConnectivityFormData({
                        voltageLevelId: staticCompensator.voltageLevelId,
                        busbarSectionId: staticCompensator.busOrBusbarSectionId,
                        connectionDirection: staticCompensator.connectablePosition.connectionDirection,
                        connectionName: staticCompensator.connectablePosition.connectionName,
                        connectionPosition: undefined,
                        terminalConnected: undefined,
                        isEquipmentModification: false,
                    }),
                    ...getReactiveFormData({
                        maxSusceptance: staticCompensator.maxSusceptance,
                        minSusceptance: staticCompensator.minSusceptance,
                        nominalV: staticCompensator.nominalV,
                        maxQAtNominalV: null,
                        minQAtNominalV: null,
                        regulationMode: staticCompensator.isRegulating
                            ? staticCompensator.regulationMode
                            : VOLTAGE_REGULATION_MODES.OFF.id,
                        voltageSetpoint: staticCompensator.voltageSetpoint,
                        reactivePowerSetpoint: staticCompensator.reactivePowerSetpoint,
                        voltageRegulationType:
                            staticCompensator?.regulatingTerminalId ||
                            staticCompensator?.regulatingTerminalConnectableId
                                ? REGULATION_TYPES.DISTANT.id
                                : REGULATION_TYPES.LOCAL.id,
                        voltageLevelId: staticCompensator.regulatingTerminalVlId,
                        equipmentType: staticCompensator.regulatingTerminalConnectableType,
                        equipmentId:
                            staticCompensator.regulatingTerminalConnectableId || staticCompensator.regulatingTerminalId,
                    }),
                    ...getStandbyAutomatonFormData({
                        addStandbyAutomaton: !!staticCompensator.standbyAutomatonInfos,
                        standby: staticCompensator.standbyAutomatonInfos?.standby,
                        b0: staticCompensator.standbyAutomatonInfos?.b0,
                        q0: computeQ0(staticCompensator.standbyAutomatonInfos?.b0, staticCompensator.nominalV),
                        lowVoltageSetpoint: staticCompensator.standbyAutomatonInfos?.lowVoltageSetpoint,
                        highVoltageSetpoint: staticCompensator.standbyAutomatonInfos?.highVoltageSetpoint,
                        lowVoltageThreshold: staticCompensator.standbyAutomatonInfos?.lowVoltageThreshold,
                        highVoltageThreshold: staticCompensator.standbyAutomatonInfos?.highVoltageThreshold,
                    }),
                    ...copyEquipmentPropertiesForCreation(staticCompensator),
                },
                { keepDefaultValues: true }
            );
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.STATIC_VAR_COMPENSATOR);

    useEffect(() => {
        if (editData) {
            reset(staticVarCompensatorDtoToForm(editData));
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        (formData: StaticVarCompensatorCreationFormData) => {
            const dto = staticVarCompensatorCreationFormToDto(formData);
            createStaticVarCompensator(studyUuid, currentNodeUuid, dto, editData?.uuid).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'StaticVarCompensatorCreationError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(staticVarCompensatorCreationEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={staticVarCompensatorCreationFormSchema}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                onClear={clear}
                onSave={onSubmit}
                titleId="CreateStaticVarCompensator"
                open={open}
                searchCopy={searchCopy}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                slotProps={{
                    paper: {
                        sx: {
                            height: '75vh', // we want the dialog height to be fixed even when switching tabs
                        },
                    },
                }}
                {...dialogProps}
            >
                <StaticVarCompensatorCreationForm
                    fetchVoltageLevelEquipments={fetchVoltageLevelEquipmentsCallback}
                    voltageLevelOptions={voltageLevelOptions}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    PositionDiagramPane={PositionDiagramPane}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    equipmentType={EquipmentType.STATIC_VAR_COMPENSATOR}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
