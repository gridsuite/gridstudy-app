import { Box, Button, Dialog, DialogContent, DialogProps, DialogTitle, Tab, Tabs, Theme } from '@mui/material';
import { FunctionComponent, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLoadflowModifications } from './use-loadflow-modifications';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { AGGRID_LOCALES } from 'translations/not-intl/aggrid-locales';

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
    succeed: (theme: Theme) => ({
        color: theme.palette.success.main,
    }),
    fail: (theme: Theme) => ({
        color: theme.palette.error.main,
    }),
    buttonApplyModifications: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
    }),
    typography: {
        fontWeight: 'bold',
    },
    secondTypography: {
        marginLeft: '5em',
        fontWeight: 'bold',
    },
    totalTypography: {
        marginLeft: '10px',
    },
    reactiveSlacksOverThresholdTypography: {
        marginLeft: '80px',
        fontWeight: 'bold',
        color: 'orange',
    },
    show: {
        display: 'inherit',
    },
    hide: {
        display: 'none',
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
                field: 'twoWindingsTransformerId',
                colId: 'twoWindingsTransformerId',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'Id' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'tapPositionIn' }),
                field: 'tapPositionIn',
                colId: 'tapPositionIn',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'tapPositionIn' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'tapPositionOut' }),
                field: 'tapPositionOut',
                colId: 'tapPositionOut',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'tapPositionOut' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'type',
                colId: 'type',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'Type' }) },
            },
        ];
    }, [intl]);

    const scColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'ID' }),
                field: 'shuntCompensatorId',
                colId: 'shuntCompensatorId',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'ID' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'sectionCountIn' }),
                field: 'sectionCountIn',
                colId: 'sectionCountIn',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'sectionCountIn' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'sectionCountOut' }),
                field: 'sectionCountOut',
                colId: 'sectionCountOut',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'sectionCountOut' }) },
            },
        ];
    }, [intl]);

    const displayedData = useMemo(() => {
        return tabIndex === 0 ? data?.twt : data?.sc;
    }, [data?.sc, data?.twt, tabIndex]);

    const displayedDataColDef = useMemo(() => {
        return tabIndex === 0 ? twtColumnDefs : scColumnDefs;
    }, [scColumnDefs, tabIndex, twtColumnDefs]);

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
                        rowData={displayedData}
                        columnDefs={displayedDataColDef}
                        rowSelection="single"
                        overrideLocales={AGGRID_LOCALES}
                        loading={isLoading}
                    />
                </Box>
                <Button onClick={onClose}>Fermer</Button>
            </DialogContent>
        </Dialog>
    );
};
