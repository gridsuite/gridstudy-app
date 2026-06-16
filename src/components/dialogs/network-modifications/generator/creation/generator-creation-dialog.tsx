/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import {
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    EquipmentType,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
    getConnectivityFormData,
    FieldConstants,
    getShortCircuitFormData,
    GeneratorCreationDto,
    GeneratorCreationFormData,
    GeneratorFormInfos,
    getReactiveLimitsFormData,
    getRegulatingTerminalFormData,
    REGULATION_TYPES,
    GeneratorCreationForm,
    generatorCreationFormSchema,
    generatorCreationEmptyFormData,
    generatorCreationDtoToForm,
    generatorCreationFormToDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createGenerator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils.type';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';
import { fetchVoltageLevelEquipments } from '../../../../../services/study/network-map';
import { WithModificationId } from 'services/network-modification-types';

interface GeneratorCreationDtoWithId extends GeneratorCreationDto, WithModificationId {}

export type GeneratorCreationDialogProps = NetworkModificationDialogProps & {
    editData: GeneratorCreationDtoWithId;
};

export default function GeneratorCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<GeneratorCreationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<GeneratorCreationFormData>>({
        defaultValues: generatorCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<GeneratorCreationFormData>>(generatorCreationFormSchema),
    });

    const { reset } = formMethods;
    const fromSearchCopyToFormValues = (generator: GeneratorFormInfos) => {
        reset(
            {
                [FieldConstants.EQUIPMENT_ID]: generator.id + '(1)',
                [FieldConstants.EQUIPMENT_NAME]: generator.name ?? '',
                [FieldConstants.ENERGY_SOURCE]: generator.energySource,
                [FieldConstants.MAXIMUM_ACTIVE_POWER]: generator.maxP,
                [FieldConstants.MINIMUM_ACTIVE_POWER]: generator.minP,
                [FieldConstants.RATED_NOMINAL_POWER]: generator.ratedS,
                [FieldConstants.ACTIVE_POWER_SET_POINT]: generator.targetP,
                [FieldConstants.VOLTAGE_REGULATION]: generator.voltageRegulatorOn,
                [FieldConstants.VOLTAGE_SET_POINT]: generator.targetV,
                [FieldConstants.REACTIVE_POWER_SET_POINT]: generator.targetQ,
                [FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT]: generator.generatorStartup?.plannedActivePowerSetPoint,
                [FieldConstants.MARGINAL_COST]: generator.generatorStartup?.marginalCost,
                [FieldConstants.PLANNED_OUTAGE_RATE]: generator.generatorStartup?.plannedOutageRate,
                [FieldConstants.FORCED_OUTAGE_RATE]: generator.generatorStartup?.forcedOutageRate,
                [FieldConstants.FREQUENCY_REGULATION]: generator.activePowerControl?.participate,
                [FieldConstants.DROOP]: generator.activePowerControl?.droop,
                ...getShortCircuitFormData({
                    directTransX: generator.generatorShortCircuit?.directTransX,
                    stepUpTransformerX: generator.generatorShortCircuit?.stepUpTransformerX,
                }),
                [FieldConstants.VOLTAGE_REGULATION_TYPE]:
                    generator?.regulatingTerminalId || generator?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                [FieldConstants.Q_PERCENT]: isNaN(Number(generator?.coordinatedReactiveControl?.qPercent))
                    ? null
                    : generator?.coordinatedReactiveControl?.qPercent,
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice: generator?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                    minimumReactivePower: generator?.minMaxReactiveLimits?.minQ ?? null,
                    maximumReactivePower: generator?.minMaxReactiveLimits?.maxQ ?? null,
                    reactiveCapabilityCurvePoints: generator?.reactiveCapabilityCurvePoints ?? [{}, {}],
                }),
                ...getRegulatingTerminalFormData({
                    equipmentId: generator.regulatingTerminalConnectableId || generator.regulatingTerminalId,
                    equipmentType: generator.regulatingTerminalConnectableType,
                    voltageLevelId: generator.regulatingTerminalVlId,
                }),
                ...getConnectivityFormData({
                    voltageLevelId: generator.voltageLevelId,
                    busbarSectionId: generator.busOrBusbarSectionId,
                    connectionDirection: generator.connectablePosition.connectionDirection,
                    connectionName: generator.connectablePosition.connectionName,
                    // connected is not copied on purpose: we use the default value (true) in all cases
                }),
                ...copyEquipmentPropertiesForCreation(generator),
            },
            { keepDefaultValues: true }
        );
    };

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.GENERATOR);

    useEffect(() => {
        if (editData) {
            reset(generatorCreationDtoToForm(editData));
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(generatorCreationEmptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (generatorForm: GeneratorCreationFormData) => {
            const dto = generatorCreationFormToDto(generatorForm, editData);
            createGenerator(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'GeneratorCreationError' });
            });
        },
        [currentNodeUuid, editData, studyUuid, snackError]
    );

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

    const fetchEquipments = useCallback(
        (voltageLevelId: string) =>
            fetchVoltageLevelEquipments(studyUuid, currentNode.id, currentRootNetworkUuid, voltageLevelId, true),
        [studyUuid, currentNode.id, currentRootNetworkUuid]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={generatorCreationFormSchema}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="CreateGenerator"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <GeneratorCreationForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    fetchVoltageLevelEquipments={fetchEquipments}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.GENERATOR}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
