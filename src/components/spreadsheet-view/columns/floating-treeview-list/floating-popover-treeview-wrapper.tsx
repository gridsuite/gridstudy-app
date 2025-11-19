/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Box, Popover, Slide, Tooltip } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import Button from '@mui/material/Button';
import LoupeIcon from '@mui/icons-material/Loupe';
import { fetchSpreadsheetEquipmentTypeSchema } from '../../../../services/study/network';
import { SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import { JSONSchema4 } from 'json-schema';
import { TreeviewSearchable } from './treeview-searchable';
import { usePopoverToggle } from './utils/use-popover-toggle';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

interface FormulaAutocompleteFieldProps {
    children: ReactNode;
    formMethods: UseFormReturn<any>;
    spreadsheetEquipmentType: SpreadsheetEquipmentType;
}

export function FloatingPopoverTreeviewWrapper({
    children,
    formMethods,
    spreadsheetEquipmentType,
}: Readonly<FormulaAutocompleteFieldProps>) {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const [properties, setProperties] = useState<JSONSchema4 | null>(null);
    const [formulaCursorPosition, setFormulaCursorPosition] = useState<number>(0);
    const quickSearchRef = useRef<HTMLInputElement>(null);
    const formulaTextRef = useRef<HTMLTextAreaElement | null>(null);
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    useEffect(() => {
        fetchSpreadsheetEquipmentTypeSchema(spreadsheetEquipmentType)
            .then((result) => setProperties(result))
            .catch((error) => snackWithFallback(snackError, error, { headerId: 'FetchingEquipmentSchemaError' }));
    }, [snackError, spreadsheetEquipmentType]);

    const { handleKeyDown } = usePopoverToggle(properties, setAnchorEl);

    const handleFormulaButtonClick = (e: React.MouseEvent) => {
        // Find the formula text field and get the cursor position
        const anchor = e.currentTarget.closest('[data-popover-anchor]');
        if (anchor) {
            const formulaTextElement = anchor.querySelector('textarea') as HTMLTextAreaElement;
            if (formulaTextElement) {
                formulaTextRef.current = formulaTextElement;
                setFormulaCursorPosition(formulaTextElement.selectionStart || 0);
            }
        }
        setAnchorEl(anchor);
    };

    const open = Boolean(anchorEl);
    return (
        <>
            <Box onKeyDown={handleKeyDown} sx={{ position: 'relative' }} data-popover-anchor>
                {children}
                <Tooltip title={intl.formatMessage({ id: 'EquipmentSchemaPopoverSchema' })}>
                    <Box sx={{ position: 'absolute', left: '-2.5rem', top: 0 }}>
                        <Button
                            onClick={handleFormulaButtonClick}
                            disabled={properties === null}
                            sx={{
                                minWidth: 0,
                            }}
                        >
                            <LoupeIcon />
                        </Button>
                    </Box>
                </Tooltip>
            </Box>
            <Popover
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={Slide}
                TransitionProps={{
                    onEntered: () => {
                        quickSearchRef.current?.focus();
                    },
                }}
                sx={{
                    position: 'absolute',
                    left: '2vh',
                    minHeight: 400,
                }}
            >
                <TreeviewSearchable
                    properties={properties}
                    formMethods={formMethods}
                    setAnchorEl={setAnchorEl}
                    inputRef={quickSearchRef}
                    equipmentType={spreadsheetEquipmentType}
                    formulaCursorPosition={formulaCursorPosition}
                    formulaTextRef={formulaTextRef}
                />
            </Popover>
        </>
    );
}
