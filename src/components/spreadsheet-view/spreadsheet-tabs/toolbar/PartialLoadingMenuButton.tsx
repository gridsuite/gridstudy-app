/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, ListSubheader, Menu } from '@mui/material';
import { Dataset as DatasetIcon, DatasetOutlined as DatasetDisabled } from '@mui/icons-material';
import TooltipIconButton, { type TooltipIconButtonProps } from '../../../common/tooltip-icon-button';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../../redux/reducer';
import type { SpreadsheetPartialData } from '../../types/SpreadsheetPartialData';
import { SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import PartialLoadingMenuItem from './PartialLoadingMenuItem';

export type LazyLoadingButtonProps = {} & Omit<TooltipIconButtonProps, 'tooltip' | 'size' | 'onClick'>;

export default function PartialLoadingMenuButton({ disabled, ...props }: Readonly<LazyLoadingButtonProps>) {
    const BtnIcon = disabled ? DatasetIcon : DatasetDisabled;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
    const handleClick = useCallback<NonNullable<TooltipIconButtonProps['onClick']>>(
        (event) => setAnchorEl(event.currentTarget),
        []
    );
    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
        //TODO send update to server
    }, []);
    const open = anchorEl === undefined;
    const lazyOptions = useSelector((state: AppState) => state.spreadsheetPartialData);
    const isOptionalData = (Object.keys(lazyOptions) as Array<keyof SpreadsheetPartialData>)
        .map((key) => lazyOptions[key])
        .some((option) =>
            (Object.keys(option) as Array<keyof SpreadsheetPartialData[keyof SpreadsheetPartialData]>).some(
                (key) => option[key]
            )
        ); // can't memoize it because deeply looking into, and object isn't rebuild but modified in reducer.
    return (
        <>
            <TooltipIconButton
                id="lazy-loading-button"
                aria-controls={open ? 'lazy-loading-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                tooltip={<FormattedMessage id="spreadsheet/tabs/lazy_loading/toolbar_button_tooltip" />}
                size="small"
                disabled={disabled}
                onClick={handleClick}
                {...props}
            >
                <Badge variant="dot" color="secondary" invisible={!isOptionalData}>
                    <BtnIcon color="action" />
                </Badge>
            </TooltipIconButton>
            <Menu
                id="lazy-loading-menu"
                open={open}
                onClose={handleClose}
                anchorEl={anchorEl}
                MenuListProps={{
                    'aria-labelledby': 'lazy-loading-button',
                    sx: { py: 0 },
                }}
                variant="menu"
            >
                <ListSubheader>
                    <FormattedMessage id="BRANCH" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    key={SpreadsheetEquipmentType.BRANCH}
                    option="operationalLimitsGroups"
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                />

                <ListSubheader>
                    <FormattedMessage id="LINE" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    key={SpreadsheetEquipmentType.LINE}
                    option="operationalLimitsGroups"
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                />

                <ListSubheader>
                    <FormattedMessage id="TWO_WINDINGS_TRANSFORMER" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    key={SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER}
                    option="operationalLimitsGroups"
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                />

                <ListSubheader>
                    <FormattedMessage id="GENERATOR" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    key={SpreadsheetEquipmentType.GENERATOR}
                    option="regulatingTerminal"
                    labelId="spreadsheet/tabs/lazy_loading/labels/regulatingTerminal"
                />
            </Menu>
        </>
    );
}
