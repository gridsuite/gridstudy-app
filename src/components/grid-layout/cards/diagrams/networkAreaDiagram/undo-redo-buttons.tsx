/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Fragment, type MouseEvent, useState } from 'react';
import { Divider, IconButton, List, ListItemButton, ListItemText, Popover, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { FormattedMessage } from 'react-intl';
import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';
import {
    historyStep,
    historyTargets,
    type NadEdit,
    NadEditType,
    type NadHistory,
    type NadHistoryAction,
} from 'components/workspace/diagrams/nad/nad-edit-history';

const EDIT_MESSAGE_IDS: Record<NadEditType, string> = {
    [NadEditType.MOVE_NODE]: 'nadEditMoveNode',
    [NadEditType.MOVE_LABEL]: 'nadEditMoveLabel',
    [NadEditType.ADD_VOLTAGE_LEVEL]: 'nadEditAddVoltageLevel',
    [NadEditType.ADD_FROM_FILTER]: 'nadEditAddFromFilter',
    [NadEditType.EXPAND]: 'nadEditExpand',
    [NadEditType.EXPAND_ALL]: 'nadEditExpandAll',
    [NadEditType.HIDE]: 'nadEditHide',
    [NadEditType.APPLY_FILTER]: 'nadEditApplyFilter',
    [NadEditType.REMOVE_FILTER]: 'nadEditRemoveFilter',
};

const BUTTONS = [
    { action: 'undo', messageId: 'undoNadEdit', Icon: UndoIcon },
    { action: 'redo', messageId: 'redoNadEdit', Icon: RedoIcon },
] as const;

const styles = {
    button: (theme) => ({
        width: theme.spacing(3),
        height: theme.spacing(3),
    }),
    selectedButton: (theme) => ({
        backgroundColor: theme.palette.action.selected,
    }),
    icon: {
        fontSize: 'medium',
    },
    popover: (theme) => ({
        marginTop: theme.spacing(0.5),
    }),
} as const satisfies MuiStyles;

function StateLabel({ edit }: Readonly<{ edit?: NadEdit }>) {
    if (!edit) {
        return <FormattedMessage id="nadEditInitialState" />;
    }
    return (
        <FormattedMessage
            id={EDIT_MESSAGE_IDS[edit.type]}
            values={{
                voltageLevelId: 'voltageLevelId' in edit ? edit.voltageLevelId : undefined,
                filterName: 'filterName' in edit ? edit.filterName : undefined,
            }}
        />
    );
}

interface UndoRedoButtonsProps {
    readonly history: NadHistory;
    readonly onRestoreHistoryState: (target: number) => void;
    readonly disabled?: boolean;
}

export default function UndoRedoButtons({ history, onRestoreHistoryState, disabled }: UndoRedoButtonsProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [openAction, setOpenAction] = useState<NadHistoryAction>('undo');

    const openHistoryList = (event: MouseEvent<HTMLElement>, action: NadHistoryAction) => {
        event.preventDefault();
        if (disabled || historyTargets(history, action).length === 0) {
            return;
        }
        setOpenAction(action);
        setAnchorEl(event.currentTarget);
    };

    return (
        <>
            {BUTTONS.map(({ action, messageId, Icon }) => {
                const step = historyStep(history, action);
                return (
                    <Tooltip key={action} title={<FormattedMessage id={messageId} />}>
                        <span onContextMenu={(event) => openHistoryList(event, action)}>
                            <IconButton
                                sx={mergeSx(
                                    styles.button,
                                    anchorEl && openAction === action ? styles.selectedButton : undefined
                                )}
                                onClick={() => step !== undefined && onRestoreHistoryState(step)}
                                disabled={disabled || step === undefined}
                            >
                                <Icon sx={styles.icon} />
                            </IconButton>
                        </span>
                    </Tooltip>
                );
            })}
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: styles.popover } }}
            >
                <List dense sx={{ py: 0 }}>
                    {historyTargets(history, openAction).map((target, i) => {
                        const { edit } = history.states[target];
                        const isInitialState = !edit;
                        return (
                            <Fragment key={target}>
                                {isInitialState && i > 0 && <Divider component="li" />}
                                <ListItemButton
                                    disabled={disabled}
                                    onClick={() => {
                                        setAnchorEl(null);
                                        onRestoreHistoryState(target);
                                    }}
                                >
                                    <ListItemText
                                        primary={<StateLabel edit={edit} />}
                                        slotProps={{ primary: { variant: 'caption', noWrap: true } }}
                                    />
                                </ListItemButton>
                            </Fragment>
                        );
                    })}
                </List>
            </Popover>
        </>
    );
}
