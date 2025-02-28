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
    FieldType,
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
    G1,
    G2,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS_1,
    OPERATIONAL_LIMITS_GROUPS_2,
    R,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TAB_HEADER,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../../services/utils';
import { FORM_LOADING_DELAY, UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
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
import { LimitsPane } from '../../../limits/limits-pane';
import {
    getLimitsEmptyFormData,
    getAllLimitsFormData,
    getLimitsValidationSchema,
    sanitizeLimitsGroups,
} from '../../../limits/limits-pane-utils';
import LineDialogTabs from '../line-dialog-tabs';
import { filledTextField, sanitizeString } from 'components/dialogs/dialog-utils';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/form-search-copy-hook';
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

const emptyFormData = {
    ...getHeaderEmptyFormData(),
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(false),
    ...emptyProperties,
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
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const [tabIndex, setTabIndex] = useState(LineCreationDialogTab.CHARACTERISTICS_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);

    const [isOpenLineTypesCatalogDialog, setOpenLineTypesCatalogDialog] = useState(false);

    const handleCloseLineTypesCatalogDialog = () => {
        setOpenLineTypesCatalogDialog(false);
    };

    const formSchema = yup
        .object()
        .shape({
            ...getHeaderValidationSchema(),
            ...getCharacteristicsValidationSchema(CHARACTERISTICS, displayConnectivity),
            ...getLimitsValidationSchema(false),
        })
        .concat(creationPropertiesSchema)
        .required();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue } = formMethods;

    const fromSearchCopyToFormValues = (line) => {
        reset(
            {
                ...getHeaderFormData({
                    equipmentId: line.id + '(1)',
                    equipmentName: line.name ?? '',
                }),
                ...getCharacteristicsFormData({
                    r: line.r,
                    x: line.x,
                    g1: convertInputValue(FieldType.G1, line.g1), // this form uses and displays microSiemens
                    b1: convertInputValue(FieldType.B1, line.b1),
                    g2: convertInputValue(FieldType.G2, line.g2),
                    b2: convertInputValue(FieldType.B2, line.b2),
                    ...(displayConnectivity &&
                        getConnectivityFormData(
                            {
                                voltageLevelId: line.voltageLevelId1,
                                busbarSectionId: line.busOrBusbarSectionId1,
                                connectionDirection: line.connectablePosition1.connectionDirection,
                                connectionName: line.connectablePosition1.connectionName,
                            },
                            CONNECTIVITY_1
                        )),
                    ...(displayConnectivity &&
                        getConnectivityFormData(
                            {
                                voltageLevelId: line.voltageLevelId2,
                                busbarSectionId: line.busOrBusbarSectionId2,
                                connectionDirection: line.connectablePosition2.connectionDirection,
                                connectionName: line.connectablePosition2.connectionName,
                            },
                            CONNECTIVITY_2
                        )),
                }),
                ...getAllLimitsFormData({
                    [OPERATIONAL_LIMITS_GROUPS_1]: formatCompleteCurrentLimit(line.currentLimits1),
                    [OPERATIONAL_LIMITS_GROUPS_2]: formatCompleteCurrentLimit(line.currentLimits2),
                    [SELECTED_LIMITS_GROUP_1]: line.selectedOperationalLimitsGroup1 ?? null,
                    [SELECTED_LIMITS_GROUP_2]: line.selectedOperationalLimitsGroup2 ?? null,
                }),
                ...copyEquipmentPropertiesForCreation(line),
            },
            { keepDefaultValues: true }
        );
    };

    const fromEditDataToFormValues = useCallback(
        (line) => {
            reset({
                ...getHeaderFormData({
                    equipmentId: line.equipmentId,
                    equipmentName: line.equipmentName,
                }),
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
                ...getAllLimitsFormData({
                    [OPERATIONAL_LIMITS_GROUPS_1]: line.operationalLimitsGroups1,
                    [OPERATIONAL_LIMITS_GROUPS_2]: line.operationalLimitsGroups2,
                    [SELECTED_LIMITS_GROUP_1]: line.selectedOperationalLimitsGroup1 ?? null,
                    [SELECTED_LIMITS_GROUP_2]: line.selectedOperationalLimitsGroup2 ?? null,
                }),
                ...getPropertiesFromModification(line.properties),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.LINE,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const handleLineSegmentsBuildSubmit = (data) => {
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
    };

    const onSubmit = useCallback(
        (line) => {
            const header = line[TAB_HEADER];
            const characteristics = line[CHARACTERISTICS];
            const limits = line[LIMITS];
            onCreateLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                lineId: header[EQUIPMENT_ID],
                lineName: sanitizeString(header[EQUIPMENT_NAME]),
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
                limitsGroups1: sanitizeLimitsGroups(limits[OPERATIONAL_LIMITS_GROUPS_1]),
                limitsGroups2: sanitizeLimitsGroups(limits[OPERATIONAL_LIMITS_GROUPS_2]),
                selectedLimitsGroup1: limits[SELECTED_LIMITS_GROUP_1],
                selectedLimitsGroup2: limits[SELECTED_LIMITS_GROUP_2],
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
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineCreationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError, onCreateLine]
    );

    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[CHARACTERISTICS] !== undefined) {
            tabsInError.push(LineCreationDialogTab.CHARACTERISTICS_TAB);
        }

        if (errors?.[LIMITS] !== undefined) {
            tabsInError.push(LineCreationDialogTab.LIMITS_TAB);
        }

        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }

        setTabIndexesWithError(tabsInError);
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
                aria-labelledby="dialog-create-line"
                maxWidth={'xl'}
                titleId="CreateLine"
                subtitle={headerAndTabs}
                onOpenCatalogDialog={() => setOpenLineTypesCatalogDialog(true)}
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
                    equipmentType={EQUIPMENT_TYPES.LINE}
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

LineCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default LineCreationDialog;
