/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { Grid, TextField } from '@mui/material';
import { SWITCH_ID } from '../../../utils/field-constants';
import { filledTextField } from '../../dialog-utils';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { useFormContext } from 'react-hook-form';
import SeparatorCellRenderer from '../voltage-level-topology-modification/separator-cell-renderer';
import HeaderWithTooltip from '../voltage-level-topology-modification/header-with-tooltip';
import { MoveVoltageLevelFeederBays } from './move-voltage-level-feeder-bays-dialog';
import { CustomAGGrid } from '@gridsuite/commons-ui';

interface MoveVoltageLevelFeederBaysFormProps {
    moveVoltageLevelFeederBaysData: MoveVoltageLevelFeederBays;
    currentNode: CurrentTreeNode;
    selectedId: string;
    isUpdate: boolean;
}

export function MoveVoltageLevelFeederBaysForm({
    moveVoltageLevelFeederBaysData,
    currentNode,
    selectedId,
    isUpdate,
}: Readonly<MoveVoltageLevelFeederBaysFormProps>) {
    const intl = useIntl();
    const { getValues, setValue } = useFormContext();

    const defaultColDef = useMemo(
        () => ({
            sortable: false,
            resizable: true,
            wrapHeaderText: true,
            editable: false,
            headerClass: 'centered-header',
            suppressMovable: true,
        }),
        []
    );

    const columnDefs = useMemo(
        () => [
            {
                field: SWITCH_ID,
                filter: true,
                flex: 2,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            value: data.title,
                        });
                    } else {
                        return data[SWITCH_ID];
                    }
                },
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'switchId' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
            },
        ],
        [currentNode, intl, isUpdate, getValues]
    );

    return (
        <Grid container sx={{ height: '100%' }} direction="column">
            <Grid container item spacing={2}>
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="ID"
                        value={selectedId}
                        size="small"
                        InputProps={{ readOnly: true }}
                        disabled
                        {...filledTextField}
                    />
                </Grid>
            </Grid>
            <Grid xs paddingTop={2}>
                <CustomAGGrid
                    rowData={moveVoltageLevelFeederBaysData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    suppressMovableColumns={true}
                    animateRows={false}
                    domLayout="normal"
                    headerHeight={48}
                />
            </Grid>
        </Grid>
    );
}
