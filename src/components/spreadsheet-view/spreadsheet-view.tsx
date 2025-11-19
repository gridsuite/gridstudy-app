/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Paper } from '@mui/material';
import SpreadsheetTabs from './spreadsheet-tabs/spreadsheet-tabs';
import { AppState } from '../../redux/reducer';
import type { RootState } from '../../redux/store';
import { SpreadsheetCollectionDto, SpreadsheetEquipmentType } from './types/spreadsheet.type';
import { CurrentTreeNode } from '../graph/tree-node.type';
import type { UUID } from 'node:crypto';
import { useNodeAliases } from './hooks/use-node-aliases';
import TabPanelLazy from 'components/results/common/tab-panel-lazy';
import { Spreadsheet } from './spreadsheet/spreadsheet';
import { FormattedMessage, useIntl } from 'react-intl';
import { getSpreadsheetConfigCollection, setSpreadsheetConfigCollection } from 'services/study/study-config';
import { initTableDefinitions, setActiveSpreadsheetTab } from 'redux/actions';
import { useDiagramHandlers } from '../workspace/window-contents/diagrams/common/use-diagram-handlers';
import { type MuiStyles, PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';
import { processSpreadsheetsCollectionData } from './add-spreadsheet/dialogs/add-spreadsheet-utils';
import { DiagramType } from 'components/grid-layout/cards/diagrams/diagram.type';

const styles = {
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
} as const satisfies MuiStyles;

interface SpreadsheetViewProps {
    currentNode: CurrentTreeNode;
    disabled: boolean;
}

export const SpreadsheetView: FunctionComponent<SpreadsheetViewProps> = ({ currentNode, disabled }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const { nodeAliases, resetNodeAliases } = useNodeAliases();

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const activeSpreadsheetTabUuid = useSelector((state: AppState) => state.tables.activeTabUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    // Read from inter-window communication state
    const pendingSpreadsheetTarget = useSelector((state: RootState) => state.workspace.pendingSpreadsheetTarget);
    const targetEquipmentId = pendingSpreadsheetTarget?.equipmentId;
    const targetEquipmentType = pendingSpreadsheetTarget?.equipmentType;

    const [resetConfirmationDialogOpen, setResetConfirmationDialogOpen] = useState(false);

    const handleSwitchTab = useCallback(
        (tabUuid: UUID) => {
            dispatch(setActiveSpreadsheetTab(tabUuid));
        },
        [dispatch]
    );

    // Handle tab switching when equipment target changes
    useEffect(() => {
        if (!targetEquipmentId || !targetEquipmentType) {
            return;
        }

        // Convert EquipmentType to SpreadsheetEquipmentType string for comparison
        const targetType = targetEquipmentType as unknown as SpreadsheetEquipmentType;
        const matchingTabs = tablesDefinitions.filter((def) => def.type === targetType);
        const activeTab = tablesDefinitions.find((def) => def.uuid === activeSpreadsheetTabUuid);

        if (matchingTabs.length > 0 && (!activeTab || (activeTab.type as unknown) !== targetType)) {
            handleSwitchTab(matchingTabs[0].uuid);
        }
    }, [
        targetEquipmentId,
        targetEquipmentType,
        pendingSpreadsheetTarget,
        tablesDefinitions,
        activeSpreadsheetTabUuid,
        handleSwitchTab,
    ]);

    const getStudySpreadsheetConfigCollection = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        getSpreadsheetConfigCollection(studyUuid).then((collectionData: SpreadsheetCollectionDto) => {
            const { tablesFilters, tableGlobalFilters, tableDefinitions } =
                processSpreadsheetsCollectionData(collectionData);
            dispatch(initTableDefinitions(collectionData.id, tableDefinitions, tablesFilters, tableGlobalFilters));
            resetNodeAliases(false, collectionData.nodeAliases);
        });
    }, [studyUuid, dispatch, resetNodeAliases]);

    // Reset the collection to the default one defined in the user profile
    const resetSpreadsheetCollection = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        setSpreadsheetConfigCollection(studyUuid)
            .then(() => {
                getStudySpreadsheetConfigCollection();
            })
            .catch((error) => {
                snackError({
                    messageTxt: error,
                    headerId: 'spreadsheet/reset_spreadsheet_collection/error_resetting_collection',
                });
            });
        setResetConfirmationDialogOpen(false);
    }, [studyUuid, getStudySpreadsheetConfigCollection, snackError]);

    const handleResetCollectionClick = useCallback(() => {
        if (tablesDefinitions.length > 0) {
            setResetConfirmationDialogOpen(true);
        } else {
            // reset the collection directly if no tables exist
            resetSpreadsheetCollection();
        }
    }, [tablesDefinitions, resetSpreadsheetCollection]);

    return (
        <Paper style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
            <SpreadsheetTabs
                disabled={disabled}
                selectedTabUuid={activeSpreadsheetTabUuid}
                handleSwitchTab={handleSwitchTab}
                handleResetCollectionClick={handleResetCollectionClick}
            />

            {tablesDefinitions.length === 0 ? (
                <Alert sx={styles.invalidNode} severity="warning">
                    <FormattedMessage id={'NoSpreadsheets'} />
                </Alert>
            ) : (
                nodeAliases &&
                tablesDefinitions.map((tabDef) => {
                    const isActive = activeSpreadsheetTabUuid === tabDef.uuid;
                    const equipmentIdToScrollTo =
                        (tabDef.type as unknown) === targetEquipmentType && isActive ? targetEquipmentId : null;
                    return (
                        <TabPanelLazy key={tabDef.uuid} selected={isActive}>
                            <Paper
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1,
                                }}
                            >
                                <Spreadsheet
                                    currentNode={currentNode}
                                    tableDefinition={tabDef}
                                    disabled={disabled}
                                    equipmentId={equipmentIdToScrollTo ?? null}
                                    active={isActive}
                                />
                            </Paper>
                        </TabPanelLazy>
                    );
                })
            )}
            {resetConfirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage({
                        id: 'spreadsheet/create_new_spreadsheet/replace_collection_confirmation',
                    })}
                    openConfirmationPopup={resetConfirmationDialogOpen}
                    setOpenConfirmationPopup={setResetConfirmationDialogOpen}
                    handlePopupConfirmation={resetSpreadsheetCollection}
                />
            )}
        </Paper>
    );
};
