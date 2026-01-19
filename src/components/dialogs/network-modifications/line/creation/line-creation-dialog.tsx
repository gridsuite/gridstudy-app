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
    ModificationType,
    snackWithFallback,
    TextInput,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import {
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
import { useCallback, useEffect, useMemo, useState } from 'react';
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
    toModificationProperties,
} from '../../common/properties/property-utils';
import GridItem from '../../../commons/grid-item';
import { formatCompleteCurrentLimit } from '../../../../utils/utils';
import { LimitsPane } from '../../../limits/limits-pane';
import { LineCreationInfos } from '../../../../../services/network-modification-types';
import { LineModificationFormInfos } from '../modification/line-modification-type';
import { ComputedLineCharacteristics, CurrentLimitsInfo } from '../../../line-types-catalog/line-catalog.type';
import { DeepNullable } from '../../../../utils/ts-utils';
import { OperationalLimitsGroupFormSchema } from '../../../limits/operational-limits-groups-types';
import { Limit, LineCreationFormData, LineCreationFormInfos, LineFormInfos } from './line-creation-type';
import { ObjectSchema } from 'yup';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';

const emptyFormData: Partial<LineCreationFormData> = {
    ...getHeaderEmptyFormData(),
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(false),
    ...emptyProperties,
};

type LineCreationDialogProps = NetworkModificationDialogProps & {
    editData?: LineCreationInfos; // contains data when we try to edit an existing hypothesis
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
export default function LineCreationDialog({
    editData,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    onCreateLine = createLine,
    displayConnectivity = true,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LineCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const [tabIndex, setTabIndex] = useState(LineCreationDialogTab.CHARACTERISTICS_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);

    const [isOpenLineTypesCatalogDialog, setIsOpenLineTypesCatalogDialog] = useState(false);

    const handleCloseLineTypesCatalogDialog = () => {
        setIsOpenLineTypesCatalogDialog(false);
    };

    const formSchema: ObjectSchema<DeepNullable<LineCreationFormData>> = useMemo(
        () =>
            yup
                .object()
                .shape({
                    ...getHeaderValidationSchema(),
                    ...getCharacteristicsValidationSchema(CHARACTERISTICS, displayConnectivity),
                    ...getLimitsValidationSchema(),
                })
                .concat(creationPropertiesSchema)
                .required(),
        [displayConnectivity]
    );

    const formMethods = useForm<DeepNullable<LineCreationFormData>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineCreationFormData>>(formSchema),
    });
    const { reset, setValue } = formMethods;

    const fromSearchCopyToFormValues = (line: LineFormInfos) => {
        const headerFormData = getHeaderFormData({
            equipmentId: line.id + '(1)',
            equipmentName: line.name ?? '',
        });
        const characteristicsFormData = getCharacteristicsFormData({
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
        });
        const allLimitsFormData = getAllLimitsFormData(
            formatCompleteCurrentLimit(line.currentLimits),
            line.selectedOperationalLimitsGroupId1 ?? null,
            line.selectedOperationalLimitsGroupId2 ?? null
        );
        const properties = copyEquipmentPropertiesForCreation(line);

        const formData = {
            ...headerFormData,
            ...characteristicsFormData,
            ...allLimitsFormData,
            ...properties,
        } satisfies DeepNullable<LineCreationFormData>;

        reset(formData, { keepDefaultValues: true });
    };

    const fromEditDataToFormValues = useCallback(
        (line: LineCreationInfos) => {
            const headerFormData = getHeaderFormData({
                equipmentId: line.equipmentId,
                equipmentName: line.equipmentName,
            });
            const characteristicsFormData = getCharacteristicsFormData({
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
            });
            const allLimitsFormData = getAllLimitsFormData(
                line?.operationalLimitsGroups?.map(
                    ({ id, ...baseData }) =>
                        ({
                            ...baseData,
                            name: id,
                            id: id + baseData.applicability,
                        }) satisfies OperationalLimitsGroupFormSchema
                ),
                line?.selectedOperationalLimitsGroupId1 ?? null,
                line?.selectedOperationalLimitsGroupId2 ?? null
            );
            const formData = {
                ...headerFormData,
                ...characteristicsFormData,
                ...allLimitsFormData,
                ...getPropertiesFromModification(line.properties),
            } satisfies DeepNullable<LineCreationFormData>;

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

    const handleLineSegmentsBuildSubmit = (data: ComputedLineCharacteristics) => {
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
            const lineCreationInfos: LineCreationInfos = {
                type: ModificationType.LINE_CREATION,
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
                operationalLimitsGroups: sanitizeLimitsGroups(limits[OPERATIONAL_LIMITS_GROUPS]),
                selectedOperationalLimitsGroupId1: limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID1],
                selectedOperationalLimitsGroupId2: limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID2],
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
            } satisfies LineCreationInfos;

            onCreateLine({
                lineCreationInfos,
                studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData ? editData.uuid : undefined,
                isUpdate: !!editData,
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
}
