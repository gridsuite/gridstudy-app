/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Checkbox, ListItem, ListItemIcon } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback, useMemo, useState } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { useSelector } from 'react-redux';
import { Theme } from '@mui/material/styles';
import { Event } from '../../../dialogs/dynamicsimulation/event/types/event.type';
import { ReduxState } from '../../../../redux/reducer.type';
import { ListItemProps } from '@mui/material/ListItem/ListItem';
import { getStartTime, getStartTimeUnit } from '../../../dialogs/dynamicsimulation/event/model/event.model';
import { EQUIPMENT_TYPE_LABEL_KEYS } from '../../util/model-constants';

const styles = {
    listItem: (theme: Theme) => ({
        padding: theme.spacing(0),
    }),
    label: {
        flexGrow: '1',
    },
    iconCheck: (theme: Theme) => ({
        minWidth: 0,
        marginLeft: theme.spacing(2),
    }),
    iconEdit: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
    checkbox: {},
};

export interface EventListItemProps extends ListItemProps {
    item: Event;
    index: number;
    checked: boolean;
    handleToggle: (event: Event) => void;
    onEdit: (event: Event) => void;
    isOneNodeBuilding: boolean;
}

export const EventListItem = ({
    item,
    onEdit,
    checked,
    index,
    handleToggle,
    isOneNodeBuilding,
    ...props
}: EventListItemProps) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector((state: ReduxState) => state.currentTreeNode);

    const toggle = useCallback(() => handleToggle(item), [item, handleToggle]);

    const itemLabel = useMemo(() => {
        if (!studyUuid || !currentNode || !item) {
            return;
        }

        const computedValues = {
            computedLabel: (
                <>
                    <strong>{item.equipmentId}</strong>
                    <i>{` - ${getStartTime(item)} ${getStartTimeUnit(item)}`}</i>
                </>
            ),
        } as {};

        return intl.formatMessage(
            {
                id: `Event${item.eventType}${EQUIPMENT_TYPE_LABEL_KEYS[item.equipmentType]}`,
            },
            {
                ...computedValues,
            }
        );
    }, [item, studyUuid, currentNode, intl]);

    const [hover, setHover] = useState(false);

    return (
        <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <ListItem key={item.equipmentId} {...props} sx={styles.listItem}>
                <ListItemIcon sx={styles.iconCheck}>
                    <Checkbox
                        sx={styles.checkbox}
                        color={'primary'}
                        edge="start"
                        checked={checked}
                        onClick={toggle}
                        disableRipple
                    />
                </ListItemIcon>
                <OverflowableText sx={styles.label} text={itemLabel} />
                {!isOneNodeBuilding && hover && (
                    <IconButton onClick={() => onEdit(item)} size={'small'} sx={styles.iconEdit}>
                        <EditIcon />
                    </IconButton>
                )}
            </ListItem>
            <Divider />
        </Box>
    );
};
