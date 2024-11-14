/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Paper } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import DndTable from '../../utils/dnd-table/dnd-table.jsx';

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
    arrayFormName,
    useFieldArrayOutput,
    createRows,
    columnsDefinition,
    previousValues,
    getPreviousValue,
    isValueModified,
    permanentCurrentLimitField,
    disableTableCell,
}) => {
    return (
        <Paper sx={styles.limitsBackground}>
            {permanentCurrentLimitField}
            <Box component={`h4`}>
                <FormattedMessage id="TemporaryCurrentLimitsText" />
            </Box>
            <DndTable
                arrayFormName={arrayFormName}
                useFieldArrayOutput={useFieldArrayOutput}
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
