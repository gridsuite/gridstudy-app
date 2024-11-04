/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, TextInput, useSnackMessage } from '@gridsuite/commons-ui';
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
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    G1,
    G2,
    LIMITS,
    PERMANENT_LIMIT,
    R,
    TAB_HEADER,
    TEMPORARY_LIMITS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../../services/utils';
import { microUnitToUnit, unitToMicroUnit } from 'utils/unit-converter';
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
import { getHeaderEmptyFormData, getHeaderFormData, getHeaderValidationSchema } from './line-creation-dialog-utils';
import LimitsPane from '../../../limits/limits-pane';
import {
    getLimitsEmptyFormData,
    getLimitsFormData,
    getLimitsValidationSchema,
} from '../../../limits/limits-pane-utils';
import LineDialogTabs from '../line-dialog-tabs';
import { filledTextField, sanitizeString } from 'components/dialogs/dialog-utils';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/form-search-copy-hook';
import { addSelectedFieldToRows } from 'components/utils/dnd-table/dnd-table';
import { formatTemporaryLimits } from 'components/utils/utils';
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
import { GridItem } from '../../../commons/grid-item';

const emptyFormData = {
    ...getHeaderEmptyFormData(),
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(),
    ...emptyProperties,
};

export const LineCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
};

/**
 * Dialog to create a line in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
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
            ...getLimitsValidationSchema(),
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
                    g1: unitToMicroUnit(line.g1), // this form uses and displays microSiemens
                    b1: unitToMicroUnit(line.b1),
                    g2: unitToMicroUnit(line.g2),
                    b2: unitToMicroUnit(line.b2),
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
                ...getLimitsFormData({
                    permanentLimit1: line.currentLimits1?.permanentLimit,
                    permanentLimit2: line.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        formatTemporaryLimits(line.currentLimits1?.temporaryLimits)
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        formatTemporaryLimits(line.currentLimits2?.temporaryLimits)
                    ),
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
                    g1: unitToMicroUnit(line.g1),
                    b1: unitToMicroUnit(line.b1),
                    g2: unitToMicroUnit(line.g2),
                    b2: unitToMicroUnit(line.b2),
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: line.busOrBusbarSectionId1,
                            connectionDirection: line.connectionDirection1,
                            connectionName: line.connectionName1,
                            connectionPosition: line.connectionPosition1,
                            voltageLevelId: line.voltageLevelId1,
                            connected: line.connected1,
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
                            connected: line.connected2,
                        },
                        CONNECTIVITY_2
                    ),
                }),
                ...getLimitsFormData({
                    permanentLimit1: line.currentLimits1?.permanentLimit,
                    permanentLimit2: line.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        formatTemporaryLimits(line.currentLimits1?.temporaryLimits)
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        formatTemporaryLimits(line.currentLimits2?.temporaryLimits)
                    ),
                }),
                ...getPropertiesFromModification(line.properties),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.LINE,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const sanitizeLimitNames = (temporaryLimitList) =>
        temporaryLimitList.map(({ name, ...temporaryLimit }) => ({
            ...temporaryLimit,
            name: sanitizeString(name),
        }));

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
            onCreateLine(
                studyUuid,
                currentNodeUuid,
                header[EQUIPMENT_ID],
                sanitizeString(header[EQUIPMENT_NAME]),
                characteristics[R],
                characteristics[X],
                microUnitToUnit(characteristics[G1]),
                microUnitToUnit(characteristics[B1]),
                microUnitToUnit(characteristics[G2]),
                microUnitToUnit(characteristics[B2]),
                characteristics[CONNECTIVITY_1]?.[VOLTAGE_LEVEL]?.id,
                characteristics[CONNECTIVITY_1]?.[BUS_OR_BUSBAR_SECTION]?.id,
                characteristics[CONNECTIVITY_2]?.[VOLTAGE_LEVEL]?.id,
                characteristics[CONNECTIVITY_2]?.[BUS_OR_BUSBAR_SECTION]?.id,
                limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                sanitizeLimitNames(limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]),
                sanitizeLimitNames(limits[CURRENT_LIMITS_2]?.[TEMPORARY_LIMITS]),
                !!editData,
                editData ? editData.uuid : undefined,
                sanitizeString(characteristics[CONNECTIVITY_1]?.[CONNECTION_NAME]),
                characteristics[CONNECTIVITY_1]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                sanitizeString(characteristics[CONNECTIVITY_2]?.[CONNECTION_NAME]),
                characteristics[CONNECTIVITY_2]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                characteristics[CONNECTIVITY_1]?.[CONNECTION_POSITION] ?? null,
                characteristics[CONNECTIVITY_2]?.[CONNECTION_POSITION] ?? null,
                characteristics[CONNECTIVITY_1]?.[CONNECTED] ?? null,
                characteristics[CONNECTIVITY_2]?.[CONNECTED] ?? null,
                toModificationProperties(line)
            ).catch((error) => {
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
                maxWidth={'md'}
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
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default LineCreationDialog;
