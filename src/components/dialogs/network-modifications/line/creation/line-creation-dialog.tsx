/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    FieldType,
    getAllLimitsFormData,
    getConnectivityFormData,
    getLineCharacteristicsFormData,
    LineCreationDto,
    lineCreationDtoToForm,
    lineCreationEmptyFormData,
    LineCreationFormData,
    lineCreationFormSchema,
    lineCreationFormToDto,
    LineForm,
    LineFormInfos,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { LINE_SEGMENTS } from 'components/utils/field-constants';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../../services/utils';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from '../../../commons/modificationDialog';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import LineTypeSegmentDialog from '../../../line-types-catalog/line-type-segment-dialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createLine } from '../../../../../services/study/network-modifications';
import { formatCompleteCurrentLimit } from '../../../../utils/utils';
import { ComputedLineCharacteristics } from '../../../line-types-catalog/line-catalog.type';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import {
    convertLimitsToOperationalLimitsGroupFormSchema,
    convertToLineSegmentInfos,
    SegmentFormData,
} from '../../../line-types-catalog/segment-utils';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';

type LineCreationDialogProps = NetworkModificationDialogProps & {
    editData?: LineCreationDto; // contains data when we try to edit an existing hypothesis
    onCreateLine: typeof createLine;
    displayConnectivity?: boolean;
};

/**
 * Dialog to create a line in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param onCreateLine callback to customize line creation process
 * @param displayConnectivity to display connectivity section or not
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineCreationDialog = ({
    editData,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    onCreateLine = createLine,
    displayConnectivity = true,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LineCreationDialogProps>) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const [isOpenLineTypesCatalogDialog, setIsOpenLineTypesCatalogDialog] = useState(false);

    const handleCloseLineTypesCatalogDialog = () => {
        setIsOpenLineTypesCatalogDialog(false);
    };

    const formMethods = useForm<DeepNullable<LineCreationFormData>>({
        defaultValues: lineCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<LineCreationFormData>>(lineCreationFormSchema),
    });

    const { reset, setValue, watch } = formMethods;

    // TODO DBR
    //const editSegmentValue = watch(LINE_SEGMENTS);

    const fromSearchCopyToFormValues = (line: LineFormInfos) => {
        const formData = {
            equipmentID: line.id + '(1)',
            equipmentName: line.name ?? '',
            connectivity: {
                ...getConnectivityFormData(
                    {
                        voltageLevelId: line.voltageLevelId1,
                        busbarSectionId: line.busOrBusbarSectionId1,
                        connectionDirection: line.connectablePosition1.connectionDirection,
                        connectionName: line.connectablePosition1.connectionName,
                        connectionPosition: line.connectablePosition1.connectionPosition,
                        terminalConnected: line.terminal1Connected,
                    },
                    FieldConstants.CONNECTIVITY_1
                ),
                ...getConnectivityFormData(
                    {
                        voltageLevelId: line.voltageLevelId2,
                        busbarSectionId: line.busOrBusbarSectionId2,
                        connectionDirection: line.connectablePosition2.connectionDirection,
                        connectionName: line.connectablePosition2.connectionName,
                        connectionPosition: line.connectablePosition2.connectionPosition,
                        terminalConnected: line.terminal2Connected,
                    },
                    FieldConstants.CONNECTIVITY_2
                ),
            },
            ...getLineCharacteristicsFormData({
                r: line.r,
                x: line.x,
                g1: convertInputValue(FieldType.G1, line.g1), // this form uses and displays microSiemens
                b1: convertInputValue(FieldType.B1, line.b1),
                g2: convertInputValue(FieldType.G2, line.g2),
                b2: convertInputValue(FieldType.B2, line.b2),
            }),
            ...getAllLimitsFormData(
                formatCompleteCurrentLimit(line.currentLimits),
                line.selectedOperationalLimitsGroupId1 ?? null,
                line.selectedOperationalLimitsGroupId2 ?? null
            ),
            ...copyEquipmentPropertiesForCreation(line),
            [LINE_SEGMENTS]: [],
        };
        reset(formData, { keepDefaultValues: true });
    };

    const fromEditDataToFormValues = useCallback(
        (line: LineCreationDto) => {
            reset(lineCreationDtoToForm(line));
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.LINE);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    /* TODO DBR
    const handleLineSegmentsBuildSubmit = (
        data: ComputedLineCharacteristics,
        lineSegments: DeepNullable<SegmentFormData | null>[]
    ) => {
        setValue(`${CHARACTERISTICS}.${R}`, data[TOTAL_RESISTANCE], {
            shouldDirty: true,
        });
        setValue(`${CHARACTERISTICS}.${X}`, data[TOTAL_REACTANCE], {
            shouldDirty: true,
        });
        setValue(`${CHARACTERISTICS}.${B1}`, data[TOTAL_SUSCEPTANCE] / 2, {
            shouldDirty: true,
        });
        setValue(`${CHARACTERISTICS}.${B2}`, data[TOTAL_SUSCEPTANCE] / 2, {
            shouldDirty: true,
        });
        setValue(
            `${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}`,
            convertLimitsToOperationalLimitsGroupFormSchema(data[FINAL_CURRENT_LIMITS])
        );
        setValue(LINE_SEGMENTS, convertToLineSegmentInfos(lineSegments));
    };
    */

    const onSubmit = useCallback(
        (lineForm: LineCreationFormData) => {
            onCreateLine({
                lineCreationInfos: lineCreationFormToDto(lineForm),
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData ? editData.uuid : undefined,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineCreationError' });
            });
        },
        [onCreateLine, studyUuid, currentNodeUuid, editData, snackError]
    );

    const clear = useCallback(() => reset(lineCreationEmptyFormData), [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

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

    /* TODO DBR restore
    <LineTypeSegmentDialog
                    open={isOpenLineTypesCatalogDialog}
                    onClose={handleCloseLineTypesCatalogDialog}
                    onSave={handleLineSegmentsBuildSubmit}
                    editData={editSegmentValue}
                />
     */

    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={lineCreationFormSchema}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'xl'}
                titleId="CreateLine"
                onOpenCatalogDialog={() => setIsOpenLineTypesCatalogDialog(true)}
                searchCopy={searchCopy}
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LineForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.LINE}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineCreationDialog;
