import React, { SetStateAction, useCallback, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Tabs,
    Tab,
    Divider,
    Theme,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { NetworkNodeIcon, useDebounce } from '@gridsuite/commons-ui';
import { ModificationsSearchResult } from './root-network.types';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import { FormattedMessage, useIntl } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';

const styles = {
    root: (theme: Theme) => ({
        margin: theme.spacing(2),
    }),
    rootNameTitle: (theme: Theme) => ({
        fontWeight: 'bold',
    }),
    headerLeftContainer: (theme: Theme) => ({
        marginLeft: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
    }),
    uploadButton: (theme: Theme) => ({
        marginLeft: theme.spacing(2),
    }),
};
const results = [
    {
        category: 'N2',
        items: [
            { id: 'XLB149', description: 'Modification de poste' },
            { id: 'XLB149', description: 'Initialisation du plan de tension' },
        ],
    },
    {
        category: 'N2-3-4',
        items: [{ id: 'XLB1TJ', description: 'Suppression de ligne' }],
    },
    {
        category: 'Dopler 10',
        items: [{ id: 'XLB1-85TRB', description: 'Modification de poste' }],
    },
];
function createPromise(): Promise<ModificationsSearchResult[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const functionsList = [
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: 'Modification de poste',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: 'Initialisation du plan de tension',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'N2-3-4' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: 'Suppression de ligne',
                        },
                    ],
                },
                {
                    basicNodeInfos: { nodeUuid: '550e8400-e29b-41d4-a716-446655440000', name: 'Dopler 10' },
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            messageValues: 'Modification de poste',
                        },
                    ],
                },
            ];
            // @ts-ignore
            resolve(functionsList);
        }, 50); // Simulate a short delay
    });
}

interface ModificationsPanelProps {
    setIsSearchActive: React.Dispatch<SetStateAction<boolean>>;
}

const ModificationsPanel: React.FC<ModificationsPanelProps> = ({ setIsSearchActive }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([] as ModificationsSearchResult[]);
    const intl = useIntl();

    const isSearchActive = searchTerm.trim() !== '';

    const searchMatchingElements = useCallback((newSearchTerm: string) => {
        if (newSearchTerm === '' || newSearchTerm?.length === 0) {
            setResults([]);
            return;
        }
        createPromise()
            .then((data) => {
                const res = data?.filter((item) => item?.basicNodeInfos?.name?.includes(newSearchTerm));
                setResults(res);
            })
            .catch((err) => {});
        console.log(newSearchTerm);
    }, []);

    const debouncedHandleChange = useDebounce(searchMatchingElements, 700);

    const handleManualChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            debouncedHandleChange(e.target.value);
            console.log(' rrrrr: ');

            setSearchTerm(e?.target?.value);
        },
        [debouncedHandleChange, setSearchTerm]
    );
    const handleClear = useCallback(() => {
        setSearchTerm('');
        setIsSearchActive(false);
        //TODO: empty the result
    }, [setIsSearchActive]);

    return (
        <Box sx={styles.root}>
            {/* Tabs */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Tabs value={0} indicatorColor="primary">
                        <Tab label="Modifications" />
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

            {/* Search Field */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Chercher un ouvrage..."
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
                <IconButton size="small" onClick={handleClear}>
                    <CloseIcon />
                </IconButton>
            </Box>
            {isSearchActive && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    {results?.length} résultats
                </Typography>
            )}
            {/* Results */}
            <Box sx={{ mt: 2 }}>
                {results.map((result, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <NetworkNodeIcon />
                            <Typography color="textSecondary">{result?.basicNodeInfos?.name}</Typography>
                        </Box>
                        {result?.modifications?.map((modiffication, j) => (
                            <Typography key={j} variant="body2" sx={{ pl: 3 }}>
                                <strong>{modiffication.modificationUuid}</strong> - {modiffication.messageValues}
                            </Typography>
                        ))}
                        <Divider sx={{ mt: 2 }} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default ModificationsPanel;
