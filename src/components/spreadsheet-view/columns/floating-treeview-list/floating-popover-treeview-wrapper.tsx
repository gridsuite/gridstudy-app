/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Box, Popover, Slide, Tooltip } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import Button from '@mui/material/Button';
import LoupeIcon from '@mui/icons-material/Loupe';
import { fetchSpreadsheetEquipmentTypeSchema } from '../../../../services/study/network';
import { SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import { JSONSchema4 } from 'json-schema';
import { TreeviewSearchable } from './treeview-searchable';
import { usePopoverToggle } from './utils/use-popover-toggle';
import { useSnackMessage } from '@gridsuite/commons-ui';
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
    const quickSearchRef = useRef<HTMLInputElement>(null);
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    useEffect(() => {
        fetchSpreadsheetEquipmentTypeSchema(spreadsheetEquipmentType)
            .then((result) => setProperties(result))
            .catch((error) => snackError({ headerId: 'FetchingEquipmentSchemaError', messageTxt: error }));
    }, [snackError, spreadsheetEquipmentType]);

    const { handleKeyDown } = usePopoverToggle(properties, setAnchorEl);

    const open = Boolean(anchorEl);
    return (
        <>
            <Box onKeyDown={handleKeyDown} sx={{ position: 'relative' }}>
                {children}
                <Tooltip title={intl.formatMessage({ id: 'EquipmentSchemaPopoverSchema' })}>
                    <Box sx={{ position: 'absolute', left: '-3rem', top: 0 }}>
                        <Button
                            onClick={(e) => setAnchorEl(e.currentTarget.closest('[data-popover-anchor]'))}
                            disabled={properties === null}
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
                />
            </Popover>
        </>
    );
}
