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

    const twtColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'Id' }),
                sort: SortWay.ASC,
                field: 'twoWindingsTransformerId',
                colId: 'twoWindingsTransformerId',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'Id' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'loadflowModificationsTapIn' }),
                field: 'tapPositionIn',
                colId: 'tapPositionIn',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'loadflowModificationsTapIn' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'loadflowModificationsTapOut' }),
                field: 'tapPositionOut',
                colId: 'tapPositionOut',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'loadflowModificationsTapOut' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'type',
                colId: 'type',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'Type' }) },
                valueFormatter: (params: ValueFormatterParams) => intl.formatMessage({ id: params.value }),
            },
        ];
    }, [intl]);

    const scColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'ID' }),
                sort: SortWay.ASC,
                field: 'shuntCompensatorId',
                colId: 'shuntCompensatorId',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'ID' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'loadflowModificationsSectionCountIn' }),
                field: 'sectionCountIn',
                colId: 'sectionCountIn',
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'loadflowModificationsSectionCountIn' }),
                },
            },
            {
                headerName: intl.formatMessage({ id: 'loadflowModificationsSectionCountOut' }),
                field: 'sectionCountOut',
                colId: 'sectionCountOut',
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'loadflowModificationsSectionCountOut' }),
                },
            },
        ];
    }, [intl]);

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
