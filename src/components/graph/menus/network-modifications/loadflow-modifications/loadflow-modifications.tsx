/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Dialog, DialogContent, DialogProps, DialogTitle, Tab, Tabs } from '@mui/material';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLoadflowModifications } from './use-loadflow-modifications';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { AGGRID_LOCALES } from 'translations/not-intl/aggrid-locales';
import { GridReadyEvent, RowDataUpdatedEvent, ValueFormatterParams } from 'ag-grid-community';
import { SortWay } from 'types/custom-aggrid-types';

const styles = {
    container: {
        display: 'flex',
        position: 'relative',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
};

interface LoadflowModificationsProps extends DialogProps {
    onClose: () => void;
}

export const LoadflowModifications: FunctionComponent<LoadflowModificationsProps> = ({ open, onClose }) => {
    const intl = useIntl();
    const [tabIndex, setTabIndex] = useState(0);
    const [data, isLoading] = useLoadflowModifications();

    const makeAggridColumnDef = useCallback(
        (field: string, translationId: string) => ({
            headerName: intl.formatMessage({ id: translationId }),
            field: field,
            colId: field,
            headerComponentParams: { displayName: intl.formatMessage({ id: translationId }) },
        }),
        [intl]
    );

    const twtColumnDefs = useMemo(() => {
        return [
            { ...makeAggridColumnDef('twoWindingsTransformerId', 'Id'), sort: SortWay.ASC },
            makeAggridColumnDef('initialTapPosition', 'loadflowModificationsTapIn'),
            makeAggridColumnDef('solvedTapPosition', 'loadflowModificationsTapOut'),
            {
                ...makeAggridColumnDef('type', 'Type'),
                valueFormatter: (params: ValueFormatterParams) => intl.formatMessage({ id: params.value }),
            },
        ];
    }, [intl, makeAggridColumnDef]);

    const scColumnDefs = useMemo(() => {
        return [
            { ...makeAggridColumnDef('shuntCompensatorId', 'Id'), sort: SortWay.ASC },
            makeAggridColumnDef('initialSectionCount', 'loadflowModificationsSectionCountIn'),
            makeAggridColumnDef('solvedSectionCount', 'loadflowModificationsSectionCountOut'),
        ];
    }, [makeAggridColumnDef]);

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);

    const onRowDataUpdated = useCallback((params: RowDataUpdatedEvent) => {
        params.api.sizeColumnsToFit();
    }, []);

    const displayedData = useMemo(() => {
        return tabIndex === 0 ? data?.twoWindingsTransformerModifications : data?.shuntCompensatorModifications;
    }, [data?.shuntCompensatorModifications, data?.twoWindingsTransformerModifications, tabIndex]);

    const displayedDataColDef = useMemo(() => {
        return tabIndex === 0 ? twtColumnDefs : scColumnDefs;
    }, [scColumnDefs, tabIndex, twtColumnDefs]);

    const defaultColDef = {
        resizable: false,
        suppressMovable: true,
    };

    return (
        <Dialog
            PaperProps={{
                sx: {
                    height: '90vh',
                },
            }}
            fullWidth
            maxWidth="md"
            open={true}
        >
            <DialogTitle>
                {intl.formatMessage({
                    id: 'loadflowModifications',
                })}
            </DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={styles.container}>
                    <Box sx={styles.tabs}>
                        <Tabs value={tabIndex} onChange={(_event, newTabIndex) => setTabIndex(newTabIndex)}>
                            <Tab label={intl.formatMessage({ id: 'Transformateurs' })} />
                            <Tab label={intl.formatMessage({ id: 'MCS' })} />
                        </Tabs>
                    </Box>
                </Box>
                <Box mt={1} style={{ flexGrow: 1 }}>
                    <CustomAGGrid
                        defaultColDef={defaultColDef}
                        rowData={displayedData}
                        columnDefs={displayedDataColDef}
                        rowSelection="single"
                        overrideLocales={AGGRID_LOCALES}
                        loading={isLoading}
                        onGridReady={onGridReady}
                        onRowDataUpdated={onRowDataUpdated}
                    />
                </Box>
                <Button onClick={onClose}>Fermer</Button>
            </DialogContent>
        </Dialog>
    );
};
