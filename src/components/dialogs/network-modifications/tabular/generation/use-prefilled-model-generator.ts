/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LANG_FRENCH, useSnackMessage, snackWithFallback, Identifiable } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer';
import { EQUIPMENT_ID } from 'components/utils/field-constants';
import { TabularModificationType, PredefinedEquipmentProperties } from '../tabular-common';
import { getNetworkElementsInfosByGlobalFilter } from 'services/study/filter';
import { fetchNetworkElementsInfos } from 'services/study/network';
import type { UUID } from 'node:crypto';
import { getPrefilledColumnGroups } from './prefillable-columns-config';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { mapPrefilledEquipments, PrefilledModelGenerationParams } from './utils';

export interface UsePrefilledModelGeneratorProps {
    dialogMode: TabularModificationType;
    equipmentType: EQUIPMENT_TYPES;
    csvColumns: string[];
    commentLines: string[][];
    predefinedEquipmentProperties: PredefinedEquipmentProperties;
}

export const usePrefilledModelGenerator = (props: UsePrefilledModelGeneratorProps) => {
    const { dialogMode, equipmentType, csvColumns, commentLines } = props;

    const { snackError } = useSnackMessage();

    const language = useSelector((state: AppState) => state.computedLanguage);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const delimiter = useMemo(() => (language === LANG_FRENCH ? ';' : ','), [language]);

    /**
     * Fetches all equipments of the given type from the network
     */
    const fetchAllEquipments = useCallback(async (): Promise<Identifiable[]> => {
        if (!(studyUuid && currentNode?.id && currentRootNetworkUuid)) {
            return [];
        }

        try {
            const equipments = await fetchNetworkElementsInfos(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                [],
                equipmentType,
                EQUIPMENT_INFOS_TYPES.FORM.type,
                true
            );
            return mapPrefilledEquipments(equipmentType, equipments) ?? [];
        } catch (error) {
            console.error('Failed to fetch all equipments:', error);
            return [];
        }
    }, [studyUuid, currentNode, currentRootNetworkUuid, equipmentType]);

    /**
     * Fetches equipments from multiple filters using GlobalFilter
     * All filter IDs are passed to genericFilter regardless of their type
     */
    const fetchEquipmentsFromFilters = useCallback(
        async (filterIds: UUID[]): Promise<Identifiable[]> => {
            if (!(studyUuid && currentNode?.id && currentRootNetworkUuid) || !filterIds.length) {
                return [];
            }

            try {
                const globalFilter = {
                    genericFilter: filterIds,
                };

                const equipments = await getNetworkElementsInfosByGlobalFilter(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    equipmentType,
                    globalFilter,
                    EQUIPMENT_INFOS_TYPES.FORM.type
                );

                return mapPrefilledEquipments(equipmentType, equipments) ?? [];
            } catch (error) {
                console.error('Failed to fetch equipments from filters:', error);
                return [];
            }
        },
        [studyUuid, currentNode, currentRootNetworkUuid, equipmentType]
    );

    /**
     * Extracts a nested value from an object using dot notation path
     */
    const getNestedValue = useCallback((obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }, []);

    /**
     * Generates CSV content from equipments data
     */
    const generateCsvContent = useCallback(
        (equipments: Identifiable[], selectedColumnGroups: string[]): string => {
            const csvRows: string[] = [];

            // 1. Header row
            csvRows.push(csvColumns.join(delimiter));

            // 2. Comment lines
            commentLines.forEach((commentLineArray) => {
                if (Array.isArray(commentLineArray)) {
                    csvRows.push(...commentLineArray);
                }
            });

            // 3. Find selected column groups
            const columnGroups = getPrefilledColumnGroups(equipmentType);
            const selectedGroups = columnGroups.filter((g) => selectedColumnGroups.includes(g.labelId));

            // 4. Data rows
            equipments.forEach((equipment) => {
                const row = csvColumns.map((column) => {
                    // ID is always filled
                    if (column === EQUIPMENT_ID) {
                        return equipment.id ?? '';
                    }

                    // Check if this column is part of selected groups
                    for (const group of selectedGroups) {
                        const columnIndex = group.csvColumns.indexOf(column);
                        if (columnIndex !== -1) {
                            const networkField = group.networkFields[columnIndex];
                            const value = getNestedValue(equipment, networkField);
                            return value !== undefined && value !== null && value !== 'undefined' ? String(value) : '';
                        }
                    }

                    return '';
                });
                csvRows.push(row.join(delimiter));
            });

            return csvRows.join('\n');
        },
        [csvColumns, commentLines, delimiter, equipmentType, getNestedValue]
    );

    /**
     * Generates the filename for the CSV
     */
    const generateFilename = useCallback((): string => {
        const suffix = dialogMode === TabularModificationType.CREATION ? 'creation' : 'modification';
        return `${equipmentType}_${suffix}_prefilled.csv`;
    }, [equipmentType, dialogMode]);

    /**
     * Downloads the CSV file
     */
    const downloadCsvFile = useCallback((content: string, filename: string): void => {
        const bom = '\uFEFF';
        const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }, []);

    /**
     * Main handler for generating the prefilled model
     */
    const handleGeneratePrefilledModel = useCallback(
        async (params: PrefilledModelGenerationParams): Promise<void> => {
            const { restrictByFilter, filterIds, useCurrentGridState, selectedColumnGroups } = params;

            try {
                let equipments: Identifiable[];

                // Fetch equipments based on selected options
                if (restrictByFilter && filterIds.length > 0) {
                    equipments = await fetchEquipmentsFromFilters(filterIds as UUID[]);
                } else {
                    equipments = await fetchAllEquipments();
                }
                // If current grid state is not enabled, we only keep IDs (empty column groups)
                const columnsToFill = useCurrentGridState ? selectedColumnGroups : [];

                const csvContent = generateCsvContent(equipments, columnsToFill);
                const filename = generateFilename();
                downloadCsvFile(csvContent, filename);
            } catch (error) {
                snackWithFallback(snackError, error, { headerId: 'GeneratePrefilledModelError' });
            }
        },
        [
            fetchEquipmentsFromFilters,
            fetchAllEquipments,
            generateCsvContent,
            generateFilename,
            downloadCsvFile,
            snackError,
        ]
    );

    return {
        handleGeneratePrefilledModel,
    };
};
