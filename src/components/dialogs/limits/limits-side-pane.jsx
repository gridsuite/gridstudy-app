/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Paper } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import DndTable from '../../utils/dnd-table/dnd-table.jsx';
import { FloatInput } from '@gridsuite/commons-ui';
import { PERMANENT_LIMIT, TEMPORARY_LIMITS} from 'components/utils/field-constants';
import { AmpereAdornment } from '../dialog-utils';
import { useMemo } from "react";
import { useFieldArray } from "react-hook-form";

const styles = {
    limitsBackground: {
        backgroundColor: '#383838',
        padding: 2,
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919',
    },
};

export const LimitsSidePane = ({
    indexLimitSet,
    arrayFormName,
    createRows,
    columnsDefinition,
    permanentCurrentLimitPreviousValue,
    previousValues,
    getPreviousValue,
    isValueModified,
    disableTableCell,
    clearableFields,
}) => {
    const useFieldArrayOutputTemporaryLimits = useFieldArray({
        name: `${arrayFormName}[${indexLimitSet}].${TEMPORARY_LIMITS}`,
    });

    const permanentCurrentLimitField = useMemo(() => (
        <Box sx={{ maxWidth: 200 }}>
            <FloatInput
                name={`${arrayFormName}[${indexLimitSet}].${PERMANENT_LIMIT}`}
                label="PermanentCurrentLimitText"
                adornment={AmpereAdornment}
                previousValue={permanentCurrentLimitPreviousValue}
                clearable={clearableFields}
            />
        </Box>
        ),
        [arrayFormName, indexLimitSet, clearableFields, permanentCurrentLimitPreviousValue]
    );

    return (
        <Paper sx={styles.limitsBackground}>
            {permanentCurrentLimitField}
            <Box component={`h4`}>
                <FormattedMessage id="TemporaryCurrentLimitsText" />
            </Box>
            <DndTable
                arrayFormName={`${arrayFormName}[${indexLimitSet}].${TEMPORARY_LIMITS}`}
                useFieldArrayOutput={useFieldArrayOutputTemporaryLimits}
                createRows={createRows}
                columnsDefinition={columnsDefinition}
                withLeftButtons={false}
                withAddRowsDialog={false}
                withBottomButtons={false}
                withCheckboxes={false}
                withTopRightAddButton
                previousValues={previousValues}
                disableTableCell={disableTableCell}
                getPreviousValue={getPreviousValue}
                isValueModified={isValueModified}
                minRowsNumber={5}
            />
        </Paper>
    );
};
