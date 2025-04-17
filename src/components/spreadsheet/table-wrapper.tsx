/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Paper } from '@mui/material';
import { EquipmentTabs } from './equipment-tabs';
import { AppState } from '../../redux/reducer';
import { SpreadsheetCollectionDto, SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { CurrentTreeNode } from '../graph/tree-node.type';
import { UUID } from 'crypto';
import { useNodeAliases } from './custom-columns/use-node-aliases';
import TabPanelLazy from 'components/results/common/tab-panel-lazy';
import { SpreadsheetTab } from './spreadsheet-tab';
import { useIntl } from 'react-intl';
import { getSpreadsheetConfigCollection, setSpreadsheetConfigCollection } from 'services/study/study-config';
import { mapColumnsDto } from './custom-spreadsheet/custom-spreadsheet-utils';
import { initTableDefinitions, resetAllSpreadsheetGsFilters } from 'redux/actions';
import { PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';

interface TableWrapperProps {
    currentNode: CurrentTreeNode;
    equipmentId: string;
    equipmentType: SpreadsheetEquipmentType;
    equipmentChanged: boolean;
    disabled: boolean;
    onEquipmentScrolled: () => void;
}

export const TableWrapper: FunctionComponent<TableWrapperProps> = ({
    currentNode,
    equipmentId,
    equipmentType,
    equipmentChanged,
    disabled,
    onEquipmentScrolled,
}) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [activeTabUuid, setActiveTabUuid] = useState<UUID | null>(null);

    const { nodeAliases, updateNodeAliases, resetNodeAliases } = useNodeAliases();

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [resetConfirmationDialogOpen, setResetConfirmationDialogOpen] = useState(false);

    // Initialize activeTabUuid with the first tab's UUID if not already set
    useEffect(() => {
        if (!activeTabUuid && tablesDefinitions.length > 0) {
            setActiveTabUuid(tablesDefinitions[0].uuid);
        }
    }, [activeTabUuid, tablesDefinitions]);

    const shouldDisableButtons = useMemo(
        () => disabled || tablesDefinitions.length === 0,
        [disabled, tablesDefinitions]
    );

    const handleSwitchTab = useCallback((tabUuid: UUID) => {
        setActiveTabUuid(tabUuid);
    }, []);

    useEffect(() => {
        const matchingTab = tablesDefinitions.find((def) => def.type === equipmentType);
        if (matchingTab && matchingTab.uuid !== activeTabUuid) {
            setActiveTabUuid(matchingTab.uuid);
        }
    }, [activeTabUuid, equipmentType, tablesDefinitions]);

    const getStudySpreadsheetConfigCollection = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        getSpreadsheetConfigCollection(studyUuid).then((collectionData: SpreadsheetCollectionDto) => {
            const tableDefinitions = collectionData.spreadsheetConfigs.map((spreadsheetConfig, index) => {
                return {
                    uuid: spreadsheetConfig.id,
                    index: index,
                    name: spreadsheetConfig.name,
                    columns: mapColumnsDto(spreadsheetConfig.columns),
                    type: spreadsheetConfig.sheetType,
                };
            });
            dispatch(initTableDefinitions(collectionData.id, tableDefinitions));
            if (tableDefinitions.length > 0) {
                handleSwitchTab(tableDefinitions[0].uuid);
                dispatch(resetAllSpreadsheetGsFilters());
            }
            resetNodeAliases(false, collectionData.nodeAliases);
        });
    }, [studyUuid, dispatch, handleSwitchTab, resetNodeAliases]);

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
            <EquipmentTabs
                disabled={disabled}
                selectedTabUuid={activeTabUuid}
                handleSwitchTab={handleSwitchTab}
                resetNodeAliases={resetNodeAliases}
                handleResetCollectionClick={handleResetCollectionClick}
            />

            {tablesDefinitions.map((tabDef) => {
                const isActive = activeTabUuid === tabDef.uuid;
                return (
                    <TabPanelLazy key={tabDef.uuid} selected={isActive}>
                        <Paper
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1,
                            }}
                        >
                            <SpreadsheetTab
                                currentNode={currentNode}
                                tableDefinition={tabDef}
                                shouldDisableButtons={shouldDisableButtons}
                                disabled={disabled}
                                nodeAliases={nodeAliases}
                                updateNodeAliases={updateNodeAliases}
                                equipmentId={equipmentId}
                                equipmentType={equipmentType}
                                onEquipmentScrolled={onEquipmentScrolled}
                            />
                        </Paper>
                    </TabPanelLazy>
                );
            })}
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
