/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import type { PartialDeep } from 'type-fest';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, ListSubheader, Menu, styled, type SxProps, type Theme } from '@mui/material';
import { Dataset as DatasetIcon, DatasetOutlined as DatasetDisabled } from '@mui/icons-material';
import TooltipIconButton, { type TooltipIconButtonProps } from '../../../common/tooltip-icon-button';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../../redux/reducer';
import type { SpreadsheetPartialData } from '../../types/SpreadsheetPartialData';
import { SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import PartialLoadingMenuItem from './PartialLoadingMenuItem';
import { updateSpreadsheetParameters } from '../../../../services/study/spreadsheet';

function updateServerIfModified(
    studyUuid: UUID | null,
    branchOlg: boolean | undefined,
    lineOlg: boolean | undefined,
    t2wOlg: boolean | undefined,
    generatorRegTerm: boolean | undefined
) {
    // are there parameters modified?
    const patchParameters: PartialDeep<SpreadsheetPartialData> = {
        [SpreadsheetEquipmentType.BRANCH]: {
            ...(branchOlg !== undefined ? { operationalLimitsGroups: branchOlg } : {}),
        },
        [SpreadsheetEquipmentType.LINE]: {
            ...(lineOlg !== undefined ? { operationalLimitsGroups: lineOlg } : {}),
        },
        [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: {
            ...(t2wOlg !== undefined ? { operationalLimitsGroups: t2wOlg } : {}),
        },
        [SpreadsheetEquipmentType.GENERATOR]: {
            ...(generatorRegTerm !== undefined ? { regulatingTerminal: generatorRegTerm } : {}),
        },
    };
    // clean patch from empty types
    for (const key of Object.keys(patchParameters) as Array<keyof SpreadsheetPartialData>) {
        if (Object.keys(patchParameters[key]!).length <= 0) {
            delete patchParameters[key];
        }
    }
    // send update to the server if there are parameters modified
    if (studyUuid !== null && Object.keys(patchParameters).length > 0) {
        return updateSpreadsheetParameters(studyUuid, patchParameters);
    }
    return Promise.resolve();
}

const styles = {
    headers: (theme) => ({
        backgroundColor: 'transparent',
    }),
} as const satisfies Record<string, SxProps<Theme>>;

export type LazyLoadingButtonProps = {} & Omit<TooltipIconButtonProps, 'tooltip' | 'size' | 'onClick'>;

export default function PartialLoadingMenuButton({ disabled, ...props }: Readonly<LazyLoadingButtonProps>) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const BtnIcon = disabled ? DatasetDisabled : DatasetIcon;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
    const handleClick = useCallback<NonNullable<TooltipIconButtonProps['onClick']>>(
        (event) => setAnchorEl(event.currentTarget),
        []
    );
    const [branchOlg, setBranchOlg] = useState<boolean | undefined>(undefined);
    const [lineOlg, setLineOlg] = useState<boolean | undefined>(undefined);
    const [t2wOlg, setT2wOlg] = useState<boolean | undefined>(undefined);
    const [generatorRegTerm, setGeneratorRegTerm] = useState<boolean | undefined>(undefined);
    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
        updateServerIfModified(studyUuid, branchOlg, lineOlg, t2wOlg, generatorRegTerm); //TODO use promise to do loading animation
        // reset fields
        setBranchOlg(undefined);
        setLineOlg(undefined);
        setT2wOlg(undefined);
        setGeneratorRegTerm(undefined);
    }, [studyUuid, branchOlg, generatorRegTerm, lineOlg, t2wOlg]);
    const open = anchorEl !== undefined;
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
                    <BtnIcon color={open ? 'action' : 'primary'} />
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
                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="BRANCH" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    type={SpreadsheetEquipmentType.BRANCH}
                    option="operationalLimitsGroups"
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                    onChange={setBranchOlg}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="LINE" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    type={SpreadsheetEquipmentType.LINE}
                    option="operationalLimitsGroups"
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                    onChange={setLineOlg}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="TWO_WINDINGS_TRANSFORMER" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    type={SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER}
                    option="operationalLimitsGroups"
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                    onChange={setT2wOlg}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="GENERATOR" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    type={SpreadsheetEquipmentType.GENERATOR}
                    option="regulatingTerminal"
                    labelId="spreadsheet/tabs/lazy_loading/labels/regulatingTerminal"
                    onChange={setGeneratorRegTerm}
                />
            </Menu>
        </>
    );
}
