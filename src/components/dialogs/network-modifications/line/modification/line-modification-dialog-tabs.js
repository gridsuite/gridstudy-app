/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { LineCreationDialogTab } from './line-modification-dialog';
import {
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_VALUE,
} from 'components/utils/field-constants';
import { Box } from '@mui/material';
import LimitsPane from '../../../limits/limits-pane';
import { useFormContext } from 'react-hook-form';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';
import { isNodeBuilt } from 'components/graph/util/model-functions';

const LineModificationDialogTabs = ({
    studyUuid,
    currentNode,
    lineToModify,
    modifiedLine,
    tabIndex,
}) => {
    const { getValues } = useFormContext();

    const temporaryLimitHasPreviousValue = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return temporaryLimits
                ?.map(({ name }) => name)
                .includes(getValues(arrayFormName)[rowIndex]?.name);
        },
        [getValues]
    );

    const findTemporaryLimit = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return temporaryLimits?.find(
                (e) => e.name === getValues(arrayFormName)[rowIndex]?.name
            );
        },
        [getValues]
    );

    const disableTableCell = useCallback(
        (
            rowIndex,
            column,
            arrayFormName,
            temporaryLimits,
            modifiedTemporaryLimits
        ) => {
            // If the temporary limit is added, all fields are editable
            // otherwise, only the value field is editable
            return modifiedTemporaryLimits &&
                findTemporaryLimit(
                    rowIndex,
                    arrayFormName,
                    modifiedTemporaryLimits
                )?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
                ? false
                : temporaryLimitHasPreviousValue(
                      rowIndex,
                      arrayFormName,
                      temporaryLimits
                  ) && column.dataKey !== TEMPORARY_LIMIT_VALUE;
        },
        [findTemporaryLimit, temporaryLimitHasPreviousValue]
    );

    const shouldReturnPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits, modifiedValues) => {
            return (
                (temporaryLimitHasPreviousValue(
                    rowIndex,
                    arrayFormName,
                    temporaryLimits
                ) &&
                    column.dataKey === TEMPORARY_LIMIT_VALUE) ||
                findTemporaryLimit(rowIndex, arrayFormName, modifiedValues)
                    ?.modificationType ===
                    TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
            );
        },
        [findTemporaryLimit, temporaryLimitHasPreviousValue]
    );

    const getTemporaryLimitPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits, modifiedValues) => {
            if (
                shouldReturnPreviousValue(
                    rowIndex,
                    column,
                    arrayFormName,
                    temporaryLimits,
                    modifiedValues
                )
            ) {
                const temporaryLimit = findTemporaryLimit(
                    rowIndex,
                    arrayFormName,
                    temporaryLimits
                );
                if (temporaryLimit === undefined) {
                    return undefined;
                }
                if (column.dataKey === TEMPORARY_LIMIT_VALUE) {
                    return temporaryLimit?.value ?? Number.MAX_VALUE;
                } else if (column.dataKey === TEMPORARY_LIMIT_DURATION) {
                    return (
                        temporaryLimit?.acceptableDuration ?? Number.MAX_VALUE
                    );
                }
            } else {
                return undefined;
            }
        },
        [findTemporaryLimit, shouldReturnPreviousValue]
    );

    const isTemporaryLimitModified = useCallback(
        (rowIndex, arrayFormName, modifiedValues) => {
            const temporaryLimit = findTemporaryLimit(
                rowIndex,
                arrayFormName,
                modifiedValues
            );
            if (
                temporaryLimit?.modificationType ===
                    TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED &&
                !isNodeBuilt(currentNode)
            ) {
                return false;
            } else {
                return temporaryLimit?.modificationType !== undefined;
            }
        },
        [currentNode, findTemporaryLimit]
    );

    return (
        <>
            <Box
                hidden={tabIndex !== LineCreationDialogTab.CHARACTERISTICS_TAB}
                p={1}
            >
                <LineCharacteristicsPane
                    displayConnectivity={false}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    lineToModify={lineToModify}
                    clearableFields={true}
                />
            </Box>

            <Box hidden={tabIndex !== LineCreationDialogTab.LIMITS_TAB} p={1}>
                <LimitsPane
                    equipmentToModify={lineToModify}
                    modifiedEquipment={modifiedLine}
                    disableTableCell={disableTableCell}
                    clearableFields={true}
                    getTemporaryLimitPreviousValue={
                        getTemporaryLimitPreviousValue
                    }
                    isTemporaryLimitModified={isTemporaryLimitModified}
                />
            </Box>
        </>
    );
};

export default LineModificationDialogTabs;
