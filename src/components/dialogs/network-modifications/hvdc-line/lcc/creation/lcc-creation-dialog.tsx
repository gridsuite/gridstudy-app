/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FetchStatus } from '../../../../../../services/utils.type';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFormSearchCopy } from '../../../../commons/use-form-search-copy';
import { ModificationDialog } from '../../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { createLcc } from '../../../../../../services/study/network-modifications';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import { isNodeBuilt } from '../../../../../graph/util/model-functions';
import { NetworkModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../../services/study/network';
import useVoltageLevelsListInfos from '../../../../../../hooks/use-voltage-levels-list-infos';
import {
    CustomFormProvider,
    DeepNullable,
    ExtendedEquipmentType,
    FieldConstants,
    getConnectivityFormData,
    getLccHvdcLineFromSearchCopy,
    HVDC_LCC_LINE_TAB_FIELDS,
    LccConverterStationFormInfos,
    LccHvdcLineFormInfos,
    LccHvdcLineCreationDto,
    lccHvdcLineCreationDtoToForm,
    lccHvdcLineCreationEmptyFormData,
    LccHvdcLineCreationFormData,
    lccHvdcLineCreationFormSchema,
    lccHvdcLineCreationFormToDto,
    LccHvdcLineDialogTab,
    LccHvdcLineForm,
    LccShuntCompensatorInfos,
    snackWithFallback,
    useSnackMessage,
    useTabs,
} from '@gridsuite/commons-ui';
import PositionDiagramPane from '../../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

const getShuntCompensatorOnSideFromSearchCopy = (shuntCompensatorInfos?: LccShuntCompensatorInfos[]) => {
    return (
        shuntCompensatorInfos?.map((shuntCp) => ({
            [FieldConstants.SHUNT_COMPENSATOR_ID]: shuntCp.id + '(1)',
            [FieldConstants.SHUNT_COMPENSATOR_NAME]: shuntCp?.name ?? '',
            [FieldConstants.MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [FieldConstants.SHUNT_COMPENSATOR_SELECTED]: shuntCp.terminalConnected ?? true,
        })) ?? []
    );
};

function getLccConverterStationFromSearchCopy(lccConverterStationFormInfos: LccConverterStationFormInfos) {
    return {
        [FieldConstants.CONVERTER_STATION_ID]: lccConverterStationFormInfos.id + '(1)',
        [FieldConstants.CONVERTER_STATION_NAME]: lccConverterStationFormInfos?.name ?? '',
        [FieldConstants.LOSS_FACTOR]: lccConverterStationFormInfos.lossFactor,
        [FieldConstants.POWER_FACTOR]: lccConverterStationFormInfos.powerFactor,
        [FieldConstants.FILTERS_SHUNT_COMPENSATOR_TABLE]: getShuntCompensatorOnSideFromSearchCopy(
            lccConverterStationFormInfos?.shuntCompensatorsOnSide
        ),
        ...getConnectivityFormData({
            voltageLevelId: lccConverterStationFormInfos?.voltageLevelId,
            busbarSectionId: lccConverterStationFormInfos?.busOrBusbarSectionId,
            connectionDirection: lccConverterStationFormInfos.connectablePosition?.connectionDirection,
            connectionName: lccConverterStationFormInfos.connectablePosition?.connectionName,
            terminalConnected: lccConverterStationFormInfos?.terminalConnected,
            connectionPosition: undefined,
        }),
    };
}

export type LccCreationDialogProps = NetworkModificationDialogProps & {
    editData: LccHvdcLineCreationDto;
};

export function LccCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LccCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<LccHvdcLineCreationFormData>>({
        defaultValues: lccHvdcLineCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<LccHvdcLineCreationFormData>>(lccHvdcLineCreationFormSchema),
    });
    const { reset } = formMethods;
    const { errors } = formMethods.formState;

    const useTabsReturn = useTabs<LccHvdcLineDialogTab>({
        defaultTab: LccHvdcLineDialogTab.HVDC_LINE_TAB,
        errors,
        tabFields: HVDC_LCC_LINE_TAB_FIELDS,
    });

    const fromSearchCopyToFormValues = (lccHvdcLine: LccHvdcLineFormInfos) => ({
        [FieldConstants.EQUIPMENT_ID]: lccHvdcLine.id + '(1)',
        [FieldConstants.EQUIPMENT_NAME]: lccHvdcLine.name ?? '',
        [FieldConstants.HVDC_LINE_TAB]: getLccHvdcLineFromSearchCopy(lccHvdcLine),
        [FieldConstants.CONVERTER_STATION_1]: getLccConverterStationFromSearchCopy(lccHvdcLine.lccConverterStation1),
        [FieldConstants.CONVERTER_STATION_2]: getLccConverterStationFromSearchCopy(lccHvdcLine.lccConverterStation2),
    });

    const searchCopy = useFormSearchCopy((data) => {
        reset(fromSearchCopyToFormValues(data), { keepDefaultValues: true });
    }, ExtendedEquipmentType.HVDC_LINE_LCC);

    useEffect(() => {
        if (editData) {
            reset(lccHvdcLineCreationDtoToForm(editData));
        }
    }, [reset, editData]);

    const onSubmit = useCallback(
        (lccHvdcLine: LccHvdcLineCreationFormData) => {
            const dto = lccHvdcLineCreationFormToDto(lccHvdcLine);
            createLcc(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'LccCreationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => reset(lccHvdcLineCreationEmptyFormData), [reset]);

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

    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={lccHvdcLineCreationFormSchema}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="CreateLcc"
                searchCopy={searchCopy}
                onValidationError={useTabsReturn.onError}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                slotProps={{
                    paper: {
                        sx: {
                            height: '95vh',
                        },
                    },
                }}
                {...dialogProps}
            >
                <LccHvdcLineForm
                    useTabsReturn={useTabsReturn}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    equipmentType={ExtendedEquipmentType.HVDC_LINE_LCC}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
