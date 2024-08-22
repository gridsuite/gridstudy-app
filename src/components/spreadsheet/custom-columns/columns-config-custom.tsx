/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useStateBoolean, useStateNumber } from '../../../hooks/use-states';
import CustomColumnsDialog from './custom-columns-dialog';
import {
    getTableDefinitionByIndex,
    TABLES_COLUMNS_NAMES,
    TABLES_COLUMNS_NAMES_JSON,
    TABLES_DEFINITION_INDEXES,
    TABLES_DEFINITION_TYPES,
    TABLES_DEFINITIONS,
    TABLES_NAMES,
    TABLES_NAMES_INDEXES,
} from '../utils/config-tables';
import { AppState } from '../../../redux/reducer';
import { useSpreadsheetEquipments } from '../../network/use-spreadsheet-equipments';
import { IEquipment } from '../../../services/study/contingency-list';
import { formatFetchedEquipments } from '../utils/equipment-table-utils';

export type CustomColumnsConfigProps = {
    indexTab: number;
};

/* TODO: notes/ideas/questions
    - show custom columns différently in dialog selection columns (color+icon?) => nope
    - show custom columns différently in table (color+icon?) => nope
    - check at export that columns name/id is unique with custom columns exported (can't check before because of translation)
    - verify data at import
    - if import empty, warn
    - show import errors in snackbar
    - update state.allDisplayedColumnsNames + state.allLockedColumnsNames on column removed or config imported (maybe state.allReorderedTableDefinitionIndexes ?)
    - sort alphabetically columns defs by name
    - when to calculate formulas? (each time tab shown, detect data modified, cache?, ...)
    - add type with formula for render in aggrid (enum types)
*/

export default function CustomColumnsConfig({ indexTab }: Readonly<CustomColumnsConfigProps>) {
    const formulaCalculating = useStateBoolean(false); //TODO
    const formulaError = useStateBoolean(false); //TODO
    const numberColumns = useStateNumber(0);
    const dialogOpen = useStateBoolean(false);
    const allDefinitions = useSelector((state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]]);
    const uEffectNumberColumnsSetValue = numberColumns.setValue; // eslint detection
    useEffect(() => {
        uEffectNumberColumnsSetValue(allDefinitions.length);
    }, [allDefinitions.length, uEffectNumberColumnsSetValue]);

    /* eslint-disable react-hooks/rules-of-hooks -- the order of hooks is preserved because it's a vite env var  */
    if (import.meta.env.DEV) {
        const [d, setD] = useState(true);
        useEffect(() => {
            if (d) {
                console.info('TABLES_NAMES', TABLES_NAMES);
                console.info('TABLES_COLUMNS_NAMES', TABLES_COLUMNS_NAMES);
                console.info('TABLES_NAMES_INDEXES', TABLES_NAMES_INDEXES);
                console.info('TABLES_COLUMNS_NAMES_JSON', TABLES_COLUMNS_NAMES_JSON);
                console.info('TABLES_DEFINITIONS', TABLES_DEFINITIONS);
                console.info('TABLES_DEFINITION_INDEXES', TABLES_DEFINITION_INDEXES);
                console.info('TABLES_DEFINITION_TYPES', TABLES_DEFINITION_TYPES);
                setD(false);
            }
        }, [d]);
        const allCustomColumnsDefinitions = useSelector((state: AppState) => state.allCustomColumnsDefinitions);
        useEffect(() => {
            console.info('allCustomColumnsDefinitions', allCustomColumnsDefinitions);
        }, [allCustomColumnsDefinitions]);
        const allDisplayedColumnsNames = useSelector((state: AppState) => state.allDisplayedColumnsNames);
        useEffect(() => {
            console.info('allDisplayedColumnsNames', allDisplayedColumnsNames);
        }, [allDisplayedColumnsNames]);
        const allLockedColumnsNames = useSelector((state: AppState) => state.allLockedColumnsNames);
        useEffect(() => {
            console.info('allLockedColumnsNames', allLockedColumnsNames);
        }, [allLockedColumnsNames]);
        const allReorderedTableDefinitionIndexes = useSelector(
            (state: AppState) => state.allReorderedTableDefinitionIndexes
        );
        useEffect(() => {
            console.info('allReorderedTableDefinitionIndexes', allReorderedTableDefinitionIndexes);
        }, [allReorderedTableDefinitionIndexes]);
        const equipmentDefinition = useMemo(
            () => ({
                type: getTableDefinitionByIndex(indexTab)?.type!,
                fetchers: getTableDefinitionByIndex(indexTab)?.fetchers!,
            }),
            [indexTab]
        );
        const { equipments, errorMessage, isFetching } = useSpreadsheetEquipments(
            equipmentDefinition,
            useCallback(
                (fetchedEquipments: IEquipment[]) => {
                    //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
                    return formatFetchedEquipments(equipmentDefinition.type, fetchedEquipments);
                },
                [equipmentDefinition.type]
            )
        );
        useEffect(() => {
            console.info(`useSpreadsheetEquipments(${equipmentDefinition.type}) =>`, {
                equipments,
                errorMessage,
                isFetching,
            });
        }, [equipmentDefinition.type, equipments, errorMessage, isFetching]);
    }
    /* eslint-enable react-hooks/rules-of-hooks */
    return (
        <>
            <LoadingButton
                variant="text"
                color={formulaError.value ? 'error' : 'inherit'}
                aria-label={`Open custom columns config (actual ${numberColumns.value} columns)`}
                startIcon={
                    <Badge
                        color="secondary"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        max={9}
                        badgeContent={numberColumns.value}
                    >
                        <CalculateIcon />
                    </Badge>
                }
                loadingPosition="start"
                loading={formulaCalculating.value}
                onClick={dialogOpen.setTrue}
            >
                <FormattedMessage id="spreadsheet/custom_column/main_button">
                    {(txt) => (
                        <Box component="span" data-note="anti-translate-crash">
                            {txt}
                        </Box>
                    )}
                </FormattedMessage>
            </LoadingButton>
            <CustomColumnsDialog indexTab={indexTab} open={dialogOpen} />
        </>
    );
}
