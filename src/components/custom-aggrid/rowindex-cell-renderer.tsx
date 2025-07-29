/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Checkbox, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useDispatch, useSelector } from 'react-redux';
import { setCalculationSelections } from '../../redux/actions';
import { AppState } from '../../redux/reducer';
import { CustomCellRendererProps } from 'ag-grid-react';
import { useIntl } from 'react-intl';
import { CalculationRowType, CalculationType } from '../spreadsheet-view/types/calculation.type';
import { isCalculationRow } from '../spreadsheet-view/utils/calculation-utils';

const styles = {
    menuItemLabel: {
        marginLeft: 1,
    },
    calculationButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: 0,
        minWidth: 'auto',
        minHeight: 'auto',
    },
};

export const RowIndexCellRenderer = (props: CustomCellRendererProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const intl = useIntl();

    // Get tab UUID from context passed via column definition
    const tabUuid = props.colDef?.context?.tabUuid || '';

    const dispatch = useDispatch();
    const calculationSelections = useSelector((state: AppState) => state.calculationSelections);

    // Get selections for current tab
    const selections = calculationSelections[tabUuid] || [];

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectionChange = (option: CalculationType) => {
        const newSelections = selections.includes(option)
            ? selections.filter((item) => item !== option)
            : [...selections, option];

        dispatch(setCalculationSelections(tabUuid, newSelections));
    };

    if (isCalculationRow(props.data?.rowType)) {
        if (props.data?.rowType === CalculationRowType.CALCULATION_BUTTON) {
            return (
                <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <IconButton size="small" aria-label="calculate" onClick={handleClick} sx={styles.calculationButton}>
                        <CalculateIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.AVERAGE)}>
                            <Checkbox
                                checked={selections.includes(CalculationType.AVERAGE)}
                                size="small"
                                disableRipple
                            />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/average' })}
                            </Box>
                        </MenuItem>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.SUM)}>
                            <Checkbox checked={selections.includes(CalculationType.SUM)} size="small" disableRipple />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/sum' })}
                            </Box>
                        </MenuItem>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.MIN)}>
                            <Checkbox checked={selections.includes(CalculationType.MIN)} size="small" disableRipple />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/min' })}
                            </Box>
                        </MenuItem>
                        <MenuItem dense onClick={() => handleSelectionChange(CalculationType.MAX)}>
                            <Checkbox checked={selections.includes(CalculationType.MAX)} size="small" disableRipple />
                            <Box sx={styles.menuItemLabel}>
                                {intl.formatMessage({ id: 'spreadsheet/calculation/max' })}
                            </Box>
                        </MenuItem>
                    </Menu>
                </Box>
            );
        }

        // Row with calculation results - show appropriate label
        if (props.data?.rowType === CalculationRowType.CALCULATION) {
            let label = '';
            switch (props.data.calculationType) {
                case CalculationType.SUM:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/sum_abbrev' });
                    break;
                case CalculationType.AVERAGE:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/average_abbrev' });
                    break;
                case CalculationType.MIN:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/min_abbrev' });
                    break;
                case CalculationType.MAX:
                    label = intl.formatMessage({ id: 'spreadsheet/calculation/max_abbrev' });
                    break;
            }

            return (
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        fontWeight: 'bold',
                    }}
                >
                    {label}
                </Box>
            );
        }

        return null;
    }

    // For normal rows, return the row index number
    return props.value;
};
