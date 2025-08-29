/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useState } from 'react';
import { Box, Popover, Slide, Tooltip } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import Button from '@mui/material/Button';
import LoupeIcon from '@mui/icons-material/Loupe';
import { fetchSpreadsheetEquipmentTypeSchema } from '../../../../services/study/network';
import { SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import { JSONSchema7 } from 'json-schema';
import { TreeviewSearchable } from './treeview-searchable';
import { usePopoverToggle } from './utils/use-popover-toggle';

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
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [properties, setProperties] = useState<JSONSchema7 | null>(null);

    useEffect(() => {
        fetchSpreadsheetEquipmentTypeSchema(spreadsheetEquipmentType).then((result) => setProperties(result));
    }, [spreadsheetEquipmentType]);

    const { handleKeyDown } = usePopoverToggle(properties, setAnchorEl);

    const open = Boolean(anchorEl);
    return (
        <>
            <Box onKeyDown={handleKeyDown} sx={{ position: 'relative' }}>
                {children}
                <Tooltip
                    title={
                        "Ouvre la liste des champs disponibles pour l'équipement associé à la feuille, peut également être ouverte via une double pression de la touche Shift du clavier"
                    }
                >
                    <span>
                        <Button
                            sx={{ position: 'absolute', left: '-5vh', top: 0 }}
                            onClick={(e) =>
                                setAnchorEl(e.currentTarget.closest('[data-popover-anchor]') as HTMLElement)
                            }
                            disabled={properties === null}
                        >
                            <LoupeIcon />
                        </Button>
                    </span>
                </Tooltip>
            </Box>
            <Popover
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={Slide}
                sx={{ position: 'absolute', left: '5vh', maxHeight: '60vh' }}
            >
                <TreeviewSearchable properties={properties} formMethods={formMethods} setAnchorEl={setAnchorEl} />
            </Popover>
        </>
    );
}
