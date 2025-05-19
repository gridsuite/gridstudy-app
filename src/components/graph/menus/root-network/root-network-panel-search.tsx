import { SetStateAction, useCallback, useState } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Tabs, Tab, Theme, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { NotificationsUrlKeys, useDebounce, useNotificationsListener } from '@gridsuite/commons-ui';
import { ModificationsSearchResult } from './root-network.types';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import { useIntl } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';
import { NotificationType, RootNetworksUpdatedEventData } from '../../../../redux/reducer';
import { useRootNetworkNotifications } from './use-root-network-notifications';
import { RootNetworkSearchResults } from './root-network-search-results';

const styles = {
    root: (theme: Theme) => ({
        margin: theme.spacing(2),
    }),
    searchField: {
        mt: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabs: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
};

function createPromise(): Promise<ModificationsSearchResult[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const functionsList = [
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2-3-4' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"action":"LOCKOUT","equipmentId":"CHOUYL31V.COT"}',
                            messageType: 'OPERATING_STATUS_MODIFICATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'Dopler 10' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440009', name: 'N3' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440003',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440002',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440004', name: 'N1' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440002',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440001',
                            messageValues: '{"equipmentId":"PENL5(1)"}',
                            messageType: 'SUBSTATION_CREATION',
                        },
                    ],
                },
            ];
            // @ts-ignore
            resolve(functionsList);
        }, 1000); // Simulate a short delay
    });
}

interface ModificationsPanelProps {
    setIsSearchActive: React.Dispatch<SetStateAction<boolean>>;
}

const ModificationsPanel: React.FC<ModificationsPanelProps> = ({ setIsSearchActive }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([] as ModificationsSearchResult[]);
    const intl = useIntl();

    const resetSearch = useCallback(() => {
        setResults([]);
        setSearchTerm('');
        setIsSearchActive(false);
    }, [setIsSearchActive]);

    const handleBuildNode = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;

            if (
                updateTypeHeader === NotificationType.BUILD_COMPLETED ||
                updateTypeHeader === NotificationType.NODE_BUILD_STATUS_UPDATED
            ) {
                resetSearch();
            }
        },
        [resetSearch]
    );
    const handleNodeNetworkModification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;

            if (
                updateTypeHeader === NotificationType.DELETE_FINISHED ||
                updateTypeHeader === NotificationType.UPDATE_FINISHED
            ) {
                resetSearch();
            }
        },
        [resetSearch]
    );

    //reset the search result for : build/unbuild, root network update, create and update modifications
    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleBuildNode,
    });
    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleNodeNetworkModification,
    });
    useRootNetworkNotifications({
        resetSearch,
    });

    //TODO: to be removed
    const searchMatchingElements = useCallback((newSearchTerm: string) => {
        if (newSearchTerm === '' || newSearchTerm?.length === 0) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        createPromise()
            .then((data) => {
                const res = data?.filter((item) => item?.basicNodeInfos?.name?.includes(newSearchTerm));
                setResults(res);
                setIsLoading(false);
            })
            .catch((err) => {
                setIsLoading(false);
            });
    }, []);

    //TODO: replace searchMatchingElements with the real api.
    const debouncedHandleChange = useDebounce(searchMatchingElements, 700);

    const handleManualChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            debouncedHandleChange(value);
            setSearchTerm(value);
        },
        [debouncedHandleChange, setSearchTerm]
    );

    return (
        <Box sx={styles.root}>
            <Box sx={styles.header}>
                <Box sx={styles.tabs}>
                    <Tabs value={0} indicatorColor="primary">
                        <Tab
                            label={intl.formatMessage({
                                id: 'rootNetwork.modificationTab',
                            })}
                        />
                    </Tabs>

                    <Tooltip
                        title={intl.formatMessage({
                            id: 'rootNetwork.modificationsInfos',
                        })}
                        placement="left-start"
                    >
                        <InfoIcon color="primary" />
                    </Tooltip>
                </Box>

                <RootNetworkMinimizedPanelContent />
            </Box>

            <Box sx={styles.searchField}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={intl.formatMessage({
                        id: 'rootNetwork.searchPlaceholder',
                    })}
                    value={searchTerm}
                    onChange={handleManualChange}
                    size="small"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <IconButton size="small" onClick={resetSearch}>
                    <CloseIcon />
                </IconButton>
            </Box>
            {!isLoading && searchTerm.trim() !== '' && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    {results?.length} résultats
                </Typography>
            )}
            {isLoading && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    Loading...
                </Typography>
            )}
            <RootNetworkSearchResults results={results} />
        </Box>
    );
};

export default ModificationsPanel;
