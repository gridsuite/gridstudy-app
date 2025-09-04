/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useMemo } from 'react';
import {
    fetchElementsInfos,
    FILTER_EQUIPMENTS_ATTRIBUTES,
    FilterType,
    LANG_FRENCH,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { evaluateFilters } from 'services/study/filter';
import { EQUIPMENT_ID } from 'components/utils/field-constants';
import { TabularModificationType } from './tabular-common';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import type { IdentifierListFilterEquipmentAttributes } from '../../../../types/filter-lib';

interface FileDownloadParams {
    content: string;
    filename: string;
}

export interface UseFilterCsvGeneratorProps {
    dialogMode: TabularModificationType;
    equipmentType: string;
    csvColumns: string[];
    commentLines: string[][];
}

/**
 * Custom hook for filter-based CSV generation
 */
export const useFilterCsvGenerator = (props: UseFilterCsvGeneratorProps) => {
    const { dialogMode, equipmentType, csvColumns, commentLines } = props;

    const { snackError } = useSnackMessage();

    const language = useSelector((state: AppState) => state.computedLanguage);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const delimiter = useMemo(() => (language === LANG_FRENCH ? ';' : ','), [language]);

    /**
     * Extracts equipment IDs from explicit naming filter
     */
    const extractFromExplicitFilter = useCallback((filterMetadata: any): string[] => {
        const equipments = filterMetadata.specificMetadata?.[
            FILTER_EQUIPMENTS_ATTRIBUTES
        ] as IdentifierListFilterEquipmentAttributes[];

        if (!Array.isArray(equipments)) {
            return [];
        }

        return equipments.map((equipment) => equipment.equipmentID).filter(Boolean);
    }, []);

    /**
     * Extracts equipment IDs from expert filter by evaluation
     */
    const extractFromExpertFilter = useCallback(
        async (filterId: UUID): Promise<string[]> => {
            if (!(studyUuid && currentNode?.id && currentRootNetworkUuid)) {
                return [];
            }

            const results = await evaluateFilters(studyUuid, currentNode.id, currentRootNetworkUuid, [filterId], true);

            if (!results?.length || !results[0].identifiableAttributes) {
                return [];
            }

            return results[0].identifiableAttributes.map((attr) => attr.id).filter(Boolean);
        },
        [studyUuid, currentNode, currentRootNetworkUuid]
    );

    /**
     * Extracts equipment IDs based on filter type
     */
    const extractEquipmentIds = useCallback(
        async (filterId: UUID, filterMetadata: any): Promise<string[]> => {
            const filterType = filterMetadata.specificMetadata?.type;

            switch (filterType) {
                case FilterType.EXPLICIT_NAMING.id:
                    return extractFromExplicitFilter(filterMetadata);

                case FilterType.EXPERT.id:
                    return await extractFromExpertFilter(filterId);

                default:
                    return [];
            }
        },
        [extractFromExplicitFilter, extractFromExpertFilter]
    );

    /**
     * Generates CSV content
     */
    const generateCsvContent = useCallback(
        (equipmentIds: string[]): string => {
            const csvRows: string[] = [];

            // 1. Add header row
            csvRows.push(csvColumns.join(delimiter));

            // 2. Add comment lines
            commentLines.forEach((commentLineArray) => {
                if (Array.isArray(commentLineArray)) {
                    csvRows.push(...commentLineArray);
                }
            });

            // 3. Add data rows
            equipmentIds.forEach((equipmentId) => {
                const row = csvColumns.map((column) => (column === EQUIPMENT_ID ? equipmentId : ''));
                csvRows.push(row.join(delimiter));
            });

            return csvRows.join('\n');
        },
        [commentLines, csvColumns, delimiter]
    );

    /**
     * Generates filename for the CSV
     */
    const generateFilename = useCallback((): string => {
        const suffix = dialogMode === TabularModificationType.CREATION ? 'creation' : 'modification';
        return `${equipmentType}_${suffix}_template_from_filter.csv`;
    }, [equipmentType, dialogMode]);

    const downloadCsvFile = useCallback(({ content, filename }: FileDownloadParams): void => {
        const bom = '\uFEFF'; // UTF-8 BOM to ensure proper encoding detection in Excel
        const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
    }, []);

    /**
     * Main handler for generating CSV from filter
     */
    const handleGenerateFromFilter = useCallback(
        async (selectedFilters?: TreeViewFinderNodeProps[]): Promise<void> => {
            // Early returns for invalid input
            if (!selectedFilters?.length) {
                return;
            }

            const filterId = selectedFilters[0].id;

            try {
                // Fetch filter metadata
                const filterElements = await fetchElementsInfos([filterId]);

                if (!filterElements?.length) {
                    return;
                }

                const equipmentIds = await extractEquipmentIds(filterId, filterElements[0]);

                const csvContent = generateCsvContent(equipmentIds);

                const filename = generateFilename();
                downloadCsvFile({ content: csvContent, filename });
            } catch (error) {
                console.error('❌ CSV generation failed:', error);
                snackError({
                    messageTxt: error instanceof Error ? error.message : 'Unknown error occurred',
                    headerId: 'GenerateFromFilterError',
                });
            }
        },
        [extractEquipmentIds, generateCsvContent, generateFilename, downloadCsvFile, snackError]
    );

    return {
        handleGenerateFromFilter,
    };
};
