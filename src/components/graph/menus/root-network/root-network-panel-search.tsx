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
import { useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import { ModificationsSearchResult } from './root-network.types';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import { useIntl } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';
import { useRootNetworkNotifications } from './use-root-network-notifications';
import { RootNetworkSearchResults } from './root-network-search-results';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { getModifications } from '../../../../services/root-network';

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

interface ModificationsPanelProps {
    setIsSearchActive: React.Dispatch<SetStateAction<boolean>>;
}

const ModificationsPanel: React.FC<ModificationsPanelProps> = ({ setIsSearchActive }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([] as ModificationsSearchResult[]);

    const intl = useIntl();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();

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

    const searchMatchingElements = useCallback(
        (newSearchTerm: string) => {
            if (newSearchTerm === '' || newSearchTerm?.length === 0) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            if (studyUuid && currentRootNetworkUuid) {
                getModifications(studyUuid, currentRootNetworkUuid, newSearchTerm)
                    .then((results: ModificationsSearchResult[]) => {
                        setResults(results);
                        setIsLoading(false);
                    })
                    .catch((errmsg) => {
                        setIsLoading(false);
                        snackError({
                            messageTxt: errmsg,
                            headerId: 'equipmentsSearchingError',
                        });
                    });
            }
        },
        [currentRootNetworkUuid, snackError, studyUuid]
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

    useEffect(() => {
        // We need to reset the search results when changing the root network.
        if (currentRootNetworkUuid) {
            resetSearch();
        }
    }, [currentRootNetworkUuid, resetSearch]);

    const getResultsCount = useCallback((results: ModificationsSearchResult[]): number => {
        return results.reduce((totalModifications, currentResult) => {
            return totalModifications + currentResult.modifications.length;
        }, 0);
    }, []);

    const debouncedHandleChange = useDebounce(searchMatchingElements, 700);

    const handleOnChange = useCallback(
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
                    onChange={handleOnChange}
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
                    {getResultsCount(results)}{' '}
                    {intl.formatMessage({
                        id: 'rootNetwork.result',
                    }) + `${getResultsCount(results) > 1 ? 's' : ''}`}
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
