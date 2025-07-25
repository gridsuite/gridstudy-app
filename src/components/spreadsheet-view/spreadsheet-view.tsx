/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Alert, Paper } from '@mui/material';
import { SpreadsheetTabs } from './spreadsheet-tabs/spreadsheet-tabs';
import { AppState } from '../../redux/reducer';
import { SpreadsheetCollectionDto, SpreadsheetEquipmentType } from './types/spreadsheet.type';
import { CurrentTreeNode } from '../graph/tree-node.type';
import { UUID } from 'crypto';
import { useNodeAliases } from './hooks/use-node-aliases';
import TabPanelLazy from 'components/results/common/tab-panel-lazy';
import { Spreadsheet } from './spreadsheet/spreadsheet';
import { FormattedMessage, useIntl } from 'react-intl';
import { getSpreadsheetConfigCollection, setSpreadsheetConfigCollection } from 'services/study/study-config';
import { initTableDefinitions } from 'redux/actions';
import { PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';
import { processSpreadsheetsCollectionData } from './add-spreadsheet/dialogs/add-spreadsheet-utils';
import { DiagramType } from 'components/diagrams/diagram.type';

const styles = {
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
};
interface SpreadsheetViewProps {
    currentNode: CurrentTreeNode;
    equipmentId: string;
    equipmentType: SpreadsheetEquipmentType;
    disabled: boolean;
    onEquipmentScrolled: () => void;
    openDiagram?: (equipmentId: string, diagramType?: DiagramType.SUBSTATION | DiagramType.VOLTAGE_LEVEL) => void;
}

export const SpreadsheetView: FunctionComponent<SpreadsheetViewProps> = ({
    currentNode,
    equipmentId,
    equipmentType,
    disabled,
    onEquipmentScrolled,
    openDiagram,
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
        if (tablesDefinitions.length === 0) {
            setActiveTabUuid(null);
        } else if (
            (!activeTabUuid && tablesDefinitions.length > 0) ||
            (activeTabUuid && !tablesDefinitions.some((def) => def.uuid === activeTabUuid))
        ) {
            setActiveTabUuid(tablesDefinitions[0].uuid);
        }
    }, [activeTabUuid, tablesDefinitions]);

    const handleSwitchTab = useCallback((tabUuid: UUID) => {
        setActiveTabUuid(tabUuid);
    }, []);

    useEffect(() => {
        // Find all tabs of the current equipmentType
        const matchingTabs = tablesDefinitions.filter((def) => def.type === equipmentType);

        // If the active tab is not of the right type, switch to the first matching tab
        const activeTab = tablesDefinitions.find((def) => def.uuid === activeTabUuid);
        if (matchingTabs.length > 0 && (!activeTab || activeTab.type !== equipmentType)) {
            setActiveTabUuid(matchingTabs[0].uuid);
        }
    }, [activeTabUuid, equipmentId, equipmentType, tablesDefinitions]);

    const getStudySpreadsheetConfigCollection = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        getSpreadsheetConfigCollection(studyUuid).then((collectionData: SpreadsheetCollectionDto) => {
            const { tablesFilters, tableGlobalFilters, tableDefinitions } =
                processSpreadsheetsCollectionData(collectionData);
            dispatch(initTableDefinitions(collectionData.id, tableDefinitions, tablesFilters, tableGlobalFilters));
            if (tableDefinitions.length > 0) {
                handleSwitchTab(tableDefinitions[0].uuid);
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
            <SpreadsheetTabs
                disabled={disabled}
                selectedTabUuid={activeTabUuid}
                handleSwitchTab={handleSwitchTab}
                resetNodeAliases={resetNodeAliases}
                handleResetCollectionClick={handleResetCollectionClick}
            />

            {tablesDefinitions.length === 0 ? (
                <Alert sx={styles.invalidNode} severity="warning">
                    <FormattedMessage id={'NoSpreadsheets'} />
                </Alert>
            ) : (
                tablesDefinitions.map((tabDef) => {
                    const isActive = activeTabUuid === tabDef.uuid;
                    const equipmentIdToScrollTo = tabDef.type === equipmentType && isActive ? equipmentId : null;
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
                                    nodeAliases={nodeAliases}
                                    updateNodeAliases={updateNodeAliases}
                                    equipmentId={equipmentIdToScrollTo}
                                    onEquipmentScrolled={onEquipmentScrolled}
                                    active={isActive}
                                    openDiagram={openDiagram}
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
