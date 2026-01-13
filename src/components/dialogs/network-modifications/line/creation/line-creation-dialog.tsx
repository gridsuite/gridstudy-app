/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    convertOutputValue,
    CustomFormProvider,
    EquipmentType,
    FieldType,
    snackWithFallback,
    TextInput,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import {
    ADDITIONAL_PROPERTIES,
    B1,
    B2,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FINAL_CURRENT_LIMITS,
    G1,
    G2,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    R,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID1,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID2,
    TAB_HEADER,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useCallback, useEffect, useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../../services/utils';
import { APPLICABILITY, FORM_LOADING_DELAY, UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { getConnectivityFormData } from '../../../connectivity/connectivity-form-utils';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsValidationSchema,
} from '../characteristics-pane/line-characteristics-pane-utils';
import {
    getHeaderEmptyFormData,
    getHeaderFormData,
    getHeaderValidationSchema,
    LineCreationDialogTab,
} from './line-creation-dialog-utils';
import {
    getAllLimitsFormData,
    getLimitsEmptyFormData,
    getLimitsValidationSchema,
    sanitizeLimitsGroups,
} from '../../../limits/limits-pane-utils';
import LineDialogTabs from '../line-dialog-tabs';
import { filledTextField, sanitizeString } from 'components/dialogs/dialog-utils';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import LineTypeSegmentDialog from '../../../line-types-catalog/line-type-segment-dialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createLine } from '../../../../../services/study/network-modifications';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    Property,
    toModificationProperties,
} from '../../common/properties/property-utils';
import GridItem from '../../../commons/grid-item';
import { formatCompleteCurrentLimit } from '../../../../utils/utils';
import { LimitsPane } from '../../../limits/limits-pane';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { LineCreationInfo, OperationalLimitsGroup } from '../../../../../services/network-modification-types';
import { LineModificationFormInfos } from '../modification/line-modification-type';
import { CurrentLimitsInfo } from '../../../line-types-catalog/line-catalog.type';
import { CurrentLimitsData } from '../../../../../services/study/network-map.type';
import { DeepNullable } from '../../../../utils/ts-utils';
import { Connectivity } from 'components/dialogs/connectivity/connectivity.type';
import {
    OperationalLimitsGroupFormSchema,
    OperationalLimitsGroupsFormSchema,
} from '../../../limits/operational-limits-groups-types';

interface LineCreationFormData {
    [TAB_HEADER]: {
        equipmentId: string;
        equipmentName?: string | null;
    };
    [CHARACTERISTICS]: {
        r?: number | null;
        x?: number | null;
        b1?: number | null;
        g1?: number | null;
        b2?: number | null;
        g2?: number | null;
        [CONNECTIVITY_1]?: Connectivity;
        [CONNECTIVITY_2]?: Connectivity;
    };
    [LIMITS]: {
        [OPERATIONAL_LIMITS_GROUPS]?: OperationalLimitsGroup[];
        [SELECTED_OPERATIONAL_LIMITS_GROUP_ID1]?: string | null;
        [SELECTED_OPERATIONAL_LIMITS_GROUP_ID2]?: string | null;
    };
    [ADDITIONAL_PROPERTIES]?: Property[];
    [key: string]: any;
}

const emptyFormData: Partial<LineCreationFormData> = {
    ...getHeaderEmptyFormData(),
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(false),
    ...emptyProperties,
};

interface ConnectablePosition {
    connectionName: string | null;
    connectionDirection: string | null;
    connectionPosition: number | null;
}

interface Limit {
    id: string;
    name: string;
    applicability: string;
    currentLimits: {
        id: string;
        permanentLimit: number;
        temporaryLimits: {
            name: string;
            acceptableDuration: number;
            value: number;
        }[];
    };
}

interface LineInfo {
    id: string;
    name: string | null;
    voltageLevelId1: string;
    voltageLevelId2: string;
    terminal1Connected: boolean;
    terminal2Connected: boolean;
    p1: number;
    q1: number;
    p2: number;
    q2: number;
    i1: number;
    i2: number;
    r: number;
    x: number;
    g1?: number;
    b1?: number;
    g2?: number;
    b2?: number;
    busOrBusbarSectionId1: string;
    busOrBusbarSectionId2: string;
    selectedOperationalLimitsGroupId1: string;
    selectedOperationalLimitsGroupId2: string;
    connectablePosition1: ConnectablePosition;
    connectablePosition2: ConnectablePosition;
    currentLimits: CurrentLimitsData[];
    properties: Record<string, string>;
}

interface LineCreationFormInfos {
    tabHeader: {
        equipmentId: string;
        equipmentName?: string;
    };
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: string;
    lineId: string;
    lineName: string | null;
    r: number | null;
    x: number | null;
    g1: number | null;
    b1: number | null;
    g2: number | null;
    b2: number | null;
    operationalLimitsGroups: OperationalLimitsGroup[];
    selectedOperationalLimitsGroupId1: string | null;
    selectedOperationalLimitsGroupId2: string | null;
    voltageLevelId1: string;
    busOrBusbarSectionId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId2: string;
    connectionName1: string | null;
    connectionName2: string | null;
    connectionDirection1: string | null;
    connectionDirection2: string | null;
    connectionPosition1: string | null;
    connectionPosition2: string | null;
    connected1: boolean;
    connected2: boolean;
    properties: Property[] | null | undefined;
    p1MeasurementValue: number | null;
    p1MeasurementValidity: boolean | null;
    q1MeasurementValue: number | null;
    q1MeasurementValidity: boolean | null;
    p2MeasurementValue: number | null;
    p2MeasurementValidity: boolean | null;
    q2MeasurementValue: number | null;
    q2MeasurementValidity: boolean | null;
    connectivity: any;
    AdditionalProperties: any;
    characteristics: any;
    stateEstimation: any;
    limits: OperationalLimitsGroupsFormSchema;
}

interface LineCreationDialogProps {
    // contains data when we try to edit an existing hypothesis from the current node's list
    editData: LineCreationInfo | null | undefined;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    onCreateLine: (line: LineCreationInfo) => Promise<string>;
    displayConnectivity?: boolean;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    //...dialogProps
}

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
}: LineCreationDialogProps) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const [tabIndex, setTabIndex] = useState(LineCreationDialogTab.CHARACTERISTICS_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);

    const [isOpenLineTypesCatalogDialog, setIsOpenLineTypesCatalogDialog] = useState(false);

    const handleCloseLineTypesCatalogDialog = () => {
        setIsOpenLineTypesCatalogDialog(false);
    };

    const formSchema = yup
        .object()
        .shape({
            ...getHeaderValidationSchema(),
            ...getCharacteristicsValidationSchema(CHARACTERISTICS, displayConnectivity),
            ...getLimitsValidationSchema(),
        })
        .concat(creationPropertiesSchema)
        .required();

    type LineCreationFormSchema = yup.InferType<typeof formSchema>;

    const formMethods = useForm<
        Omit<DeepNullable<LineCreationFormSchema>, typeof ADDITIONAL_PROPERTIES> & {
            [ADDITIONAL_PROPERTIES]?: Property[];
        }
    >({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineCreationFormSchema>>(formSchema),
    });
    const { reset, setValue } = formMethods;

    const fromSearchCopyToFormValues = (line: LineInfo) => {
        const formData = {
            ...getHeaderFormData({
                equipmentId: line.id + '(1)',
                equipmentName: line.name ?? '',
            }),
            // @ts-ignore
            ...getCharacteristicsFormData({
                r: line.r,
                x: line.x,
                g1: convertInputValue(FieldType.G1, line.g1), // this form uses and displays microSiemens
                b1: convertInputValue(FieldType.B1, line.b1),
                g2: convertInputValue(FieldType.G2, line.g2),
                b2: convertInputValue(FieldType.B2, line.b2),
                ...getConnectivityFormData(
                    {
                        voltageLevelId: line.voltageLevelId1,
                        busbarSectionId: line.busOrBusbarSectionId1,
                        connectionDirection: line.connectablePosition1.connectionDirection,
                        connectionName: line.connectablePosition1.connectionName,
                        connectionPosition: line.connectablePosition1.connectionPosition,
                        terminalConnected: line.terminal1Connected,
                    },
                    CONNECTIVITY_1
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
                    CONNECTIVITY_2
                ),
            }),
            ...getAllLimitsFormData(
                formatCompleteCurrentLimit(line.currentLimits),
                line.selectedOperationalLimitsGroupId1 ?? null,
                line.selectedOperationalLimitsGroupId2 ?? null
            ),
            ...copyEquipmentPropertiesForCreation(line),
        };
        reset(formData, { keepDefaultValues: true });
    };

    const fromEditDataToFormValues = useCallback(
        (line: LineCreationInfo) => {
            const formData = {
                ...getHeaderFormData({
                    equipmentId: line.equipmentId,
                    equipmentName: line.equipmentName,
                }),
                // @ts-ignore
                ...getCharacteristicsFormData({
                    r: line.r,
                    x: line.x,
                    g1: convertInputValue(FieldType.G1, line.g1),
                    b1: convertInputValue(FieldType.B1, line.b1),
                    g2: convertInputValue(FieldType.G2, line.g2),
                    b2: convertInputValue(FieldType.B2, line.b2),
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: line.busOrBusbarSectionId1,
                            connectionDirection: line.connectionDirection1,
                            connectionName: line.connectionName1,
                            connectionPosition: line.connectionPosition1,
                            voltageLevelId: line.voltageLevelId1,
                            terminalConnected: line.connected1,
                        },
                        CONNECTIVITY_1
                    ),
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: line.busOrBusbarSectionId2,
                            connectionDirection: line.connectionDirection2,
                            connectionName: line.connectionName2,
                            connectionPosition: line.connectionPosition2,
                            voltageLevelId: line.voltageLevelId2,
                            terminalConnected: line.connected2,
                        },
                        CONNECTIVITY_2
                    ),
                }),
                ...getAllLimitsFormData(
                    line?.operationalLimitsGroups?.map(({ id, ...baseData }) => ({
                        ...baseData,
                        name: id,
                        id: id + baseData.applicability,
                    })) as OperationalLimitsGroupFormSchema[],
                    line?.selectedOperationalLimitsGroupId1 ?? null,
                    line?.selectedOperationalLimitsGroupId2 ?? null
                ),
                ...getPropertiesFromModification(line.properties),
            };
            reset(formData, { keepDefaultValues: true });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EQUIPMENT_TYPES.LINE);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const handleLineSegmentsBuildSubmit = (data: any) => {
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
        const finalLimits: Limit[] = [];
        data[FINAL_CURRENT_LIMITS].forEach((item: CurrentLimitsInfo) => {
            const temporaryLimitsList = [];
            if (item.temporaryLimitValue) {
                temporaryLimitsList.push({
                    name: item.temporaryLimitName,
                    acceptableDuration: item.temporaryLimitAcceptableDuration,
                    value: item.temporaryLimitValue,
                });
            }
            finalLimits.push({
                id: item.limitSetName + APPLICABILITY.EQUIPMENT.id,
                name: item.limitSetName,
                applicability: APPLICABILITY.EQUIPMENT.id,
                currentLimits: {
                    id: item.limitSetName,
                    permanentLimit: item.permanentLimit,
                    temporaryLimits: temporaryLimitsList,
                },
            });
        });
        setValue(`${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}`, finalLimits);
    };

    const onSubmit = useCallback(
        (line: LineCreationFormInfos) => {
            const header = line[TAB_HEADER];
            const characteristics = line[CHARACTERISTICS];
            const limits = line[LIMITS];
            onCreateLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                equipmentId: header[EQUIPMENT_ID],
                equipmentName: sanitizeString(header[EQUIPMENT_NAME]),
                r: characteristics[R],
                x: characteristics[X],
                g1: convertOutputValue(FieldType.G1, characteristics[G1]),
                b1: convertOutputValue(FieldType.B1, characteristics[B1]),
                g2: convertOutputValue(FieldType.G2, characteristics[G2]),
                b2: convertOutputValue(FieldType.B2, characteristics[B2]),
                voltageLevelId1: characteristics[CONNECTIVITY_1]?.[VOLTAGE_LEVEL]?.id,
                busOrBusbarSectionId1: characteristics[CONNECTIVITY_1]?.[BUS_OR_BUSBAR_SECTION]?.id,
                voltageLevelId2: characteristics[CONNECTIVITY_2]?.[VOLTAGE_LEVEL]?.id,
                busOrBusbarSectionId2: characteristics[CONNECTIVITY_2]?.[BUS_OR_BUSBAR_SECTION]?.id,
                operationalLimitsGroups: sanitizeLimitsGroups(
                    limits[OPERATIONAL_LIMITS_GROUPS]
                ) as OperationalLimitsGroup[],
                selectedOperationalLimitsGroupId1: limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID1],
                selectedOperationalLimitsGroupId2: limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID2],
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
                connectionName1: sanitizeString(characteristics[CONNECTIVITY_1]?.[CONNECTION_NAME]),
                connectionDirection1:
                    characteristics[CONNECTIVITY_1]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName2: sanitizeString(characteristics[CONNECTIVITY_2]?.[CONNECTION_NAME]),
                connectionDirection2:
                    characteristics[CONNECTIVITY_2]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionPosition1: characteristics[CONNECTIVITY_1]?.[CONNECTION_POSITION] ?? null,
                connectionPosition2: characteristics[CONNECTIVITY_2]?.[CONNECTION_POSITION] ?? null,
                connected1: characteristics[CONNECTIVITY_1]?.[CONNECTED] ?? null,
                connected2: characteristics[CONNECTIVITY_2]?.[CONNECTED] ?? null,
                properties: toModificationProperties(line),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineCreationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError, onCreateLine]
    );

    const onValidationError = (errors: FieldErrors<LineModificationFormInfos>) => {
        let tabsInError = [];
        if (errors?.[CHARACTERISTICS] !== undefined) {
            tabsInError.push(LineCreationDialogTab.CHARACTERISTICS_TAB);
        }

        if (errors?.[LIMITS] !== undefined) {
            tabsInError.push(LineCreationDialogTab.LIMITS_TAB);
        }

        if (tabsInError.includes(tabIndex)) {
            // error in current tab => do not change tab systematically but remove current tab in error list
            setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
        } else if (tabsInError.length > 0) {
            // switch to the first tab in the list then remove the tab in the error list
            setTabIndex(tabsInError[0]);
            setTabIndexesWithError(tabsInError.filter((errorTabIndex, index, arr) => errorTabIndex !== arr[0]));
        }
    };

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const lineIdField = (
        <TextInput
            name={`${TAB_HEADER}.${EQUIPMENT_ID}`}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const lineNameField = (
        <TextInput name={`${TAB_HEADER}.${EQUIPMENT_NAME}`} label={'Name'} formProps={filledTextField} />
    );

    const headerAndTabs = (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container spacing={2}>
                <GridItem size={4}>{lineIdField}</GridItem>
                <GridItem size={4}>{lineNameField}</GridItem>
            </Grid>
            <LineDialogTabs tabIndex={tabIndex} tabIndexesWithError={tabIndexesWithError} setTabIndex={setTabIndex} />
        </Box>
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidationError={onValidationError}
                onSave={onSubmit}
                maxWidth={'xl'}
                titleId="CreateLine"
                subtitle={headerAndTabs}
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
                <Box hidden={tabIndex !== LineCreationDialogTab.CHARACTERISTICS_TAB} p={1}>
                    <LineCharacteristicsPane
                        displayConnectivity={displayConnectivity}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                </Box>

                <Box hidden={tabIndex !== LineCreationDialogTab.LIMITS_TAB} p={1}>
                    <LimitsPane />
                </Box>

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.LINE}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
                <LineTypeSegmentDialog
                    open={isOpenLineTypesCatalogDialog}
                    onClose={handleCloseLineTypesCatalogDialog}
                    onSave={handleLineSegmentsBuildSubmit}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineCreationDialog;
