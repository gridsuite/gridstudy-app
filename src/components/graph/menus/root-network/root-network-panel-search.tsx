/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Tabs, Tab, Theme, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useDebounce } from '@gridsuite/commons-ui';
import { ModificationsSearchResult } from './root-network.types';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import { useIntl } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';
import { useRootNetworkNotifications } from './use-root-network-notifications';
import { RootNetworkSearchResults } from './root-network-search-results';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';

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
                    nodeUuid: '7fc73769-94fd-42a4-a162-557ebf287a71',
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"qqxx"}',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"qqxx"}',
                        },
                    ],
                },
                {
                    nodeUuid: 'bf9c436b-c90a-4c49-8cef-ea3db7ebd407',
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N012"}',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N012"}',
                        },
                    ],
                },
                {
                    nodeUuid: '46a141a7-4503-4780-9ddb-e72399c432cd',
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N9"}',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N9"}',
                        },
                    ],
                },
                {
                    nodeUuid: 'a85aeb78-170a-473c-a62c-571925834fa3',
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N2"}',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N2"}',
                        },
                    ],
                },
                {
                    nodeUuid: '6cc19a1f-ea51-45ad-a94a-f5284836823a',
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N3"}',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N3"}',
                        },
                    ],
                },
                {
                    nodeUuid: 'ebdbd10d-4710-4656-831c-638520449973',
                    modifications: [
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N4"}',
                        },
                        {
                            modificationUuid: '550e8400-e29b-41d4-a716-446655440000',
                            impactedEquipmentId: 'PENL5',
                            messageType: 'SUBSTATION_CREATION',
                            messageValues: '{"equipmentId":"N4"}',
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
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const resetSearch = useCallback(() => {
        setResults([]);
        setSearchTerm('');
    }, []);

    const leaveSearch = useCallback(() => {
        resetSearch();
        setIsSearchActive(false);
    }, [resetSearch, setIsSearchActive]);
    //reset the search result for : build/unbuild, root network update, create and update modifications.
    //The current behavior is subject to change in future user stories.
    useRootNetworkNotifications({
        resetSearch,
    });

    const reOrderSearchResults = useCallback((results: ModificationsSearchResult[], currentNodeUuid?: UUID) => {
        if (!results || results.length === 0) {
            return [];
        }

        const foundCurrentNodeResults = results.find((result) => result.nodeUuid === currentNodeUuid);

        if (!foundCurrentNodeResults) {
            return [...results];
        }

        const otherNodesResults = results.filter((result) => result.nodeUuid !== currentNodeUuid);

        return [foundCurrentNodeResults, ...otherNodesResults];
    }, []);

    //TODO: to be removed
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    //get the name based on the node tree
    const getName = useCallback(
        (idToFind: UUID) => {
            if (!treeNodes) {
                return null;
            }
            const node = treeNodes.find((node) => node.id === idToFind);
            return node?.data.label;
        },
        [treeNodes]
    );

    //TODO: to be removed
    const searchMatchingElements = useCallback(
        (newSearchTerm: string) => {
            if (newSearchTerm === '' || newSearchTerm?.length === 0) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            createPromise()
                .then((data) => {
                    const res = data?.filter((item) => getName(item.nodeUuid) === newSearchTerm);
                    setResults(res);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setIsLoading(false);
                });
        },
        [getName]
    );
    useEffect(() => {
        // We need to reorder the results so the currentNode appears at the top of the list.
        // If the currentNode isn't in the results, display them as is.
        if (!results.find((item) => item.nodeUuid === currentNode?.id)) {
            return;
        }
        const shouldReorderResults = results.length > 0 && currentNode?.id && results[0].nodeUuid !== currentNode?.id;
        if (shouldReorderResults) {
            setResults(reOrderSearchResults(results, currentNode?.id));
        }
    }, [currentNode?.id, reOrderSearchResults, results]);

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
                <IconButton size="small" onClick={leaveSearch}>
                    <CloseIcon />
                </IconButton>
            </Box>
            {!isLoading && searchTerm.trim() !== '' && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    {results?.length}{' '}
                    {intl.formatMessage({
                        id: 'rootNetwork.results',
                    })}
                </Typography>
            )}
            {isLoading && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    {intl.formatMessage({
                        id: 'rootNetwork.loading',
                    })}
                </Typography>
            )}
            <RootNetworkSearchResults results={results} />
        </Box>
    );
};

export default ModificationsPanel;
