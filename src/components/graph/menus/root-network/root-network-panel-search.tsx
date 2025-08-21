/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Tooltip, Theme } from '@mui/material';
import { ModificationsSearchResult } from './root-network.types';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import { FormattedMessage, useIntl } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';
import { RootNetworkModificationsSearchResults } from './root-network-modifications-search-results';

import { useRootNetworkSearchNotifications } from './use-root-network-search-notifications';
import SearchBar from './root-network-search-bar';
import { RootNetworkNodesSearchResults } from './root-network-nodes-search-results';
import { TAB_VALUES, useRootNetworkSearch } from './use-root-network-search';

interface RootNetworkSearchPanelProps {
    setIsSearchActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function getModificationResultsCount(results: ModificationsSearchResult[]): number {
    return results.reduce((sum, r) => sum + r.modifications.length, 0);
}

function getNodeResultsCount(results: string[]): number {
    return results.length;
}

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
        justifyContent: 'center',
        alignItems: 'center',
    },
};

const RootNetworkSearchPanel: React.FC<RootNetworkSearchPanelProps> = ({ setIsSearchActive }) => {
    const intl = useIntl();
    const [tabValue, setTabValue] = useState<TAB_VALUES>(TAB_VALUES.nodes);
    const {
        searchTerm,
        isLoading,
        nodesResults,
        modificationsResults,
        handleOnChange,
        leaveSearch,
        resetNodesSearch,
        resetModificationsSearch,
    } = useRootNetworkSearch(tabValue, setIsSearchActive);

    useRootNetworkSearchNotifications({
        resetNodesSearch: resetNodesSearch,
        resetModificationsSearch: resetModificationsSearch,
    });

    const showResultsCount = !isLoading && searchTerm.trim() !== '';

    return (
        <Box sx={styles.root}>
            <Box sx={styles.header}>
                <Box sx={styles.tabs}>
                    <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} indicatorColor="primary">
                        <Tab value={TAB_VALUES.nodes} label={intl.formatMessage({ id: 'rootNetwork.nodeTab' })} />
                        <Tab
                            value={TAB_VALUES.modifications}
                            label={intl.formatMessage({ id: 'rootNetwork.modificationTab' })}
                        />
                    </Tabs>
                    <Tooltip
                        title={intl.formatMessage({ id: 'rootNetwork.modificationsInfos' })}
                        placement="left-start"
                    >
                        <InfoIcon color="primary" />
                    </Tooltip>
                </Box>
                <RootNetworkMinimizedPanelContent isRootNetworkPanelMinimized={false} />
            </Box>

            <Box sx={styles.searchField}>
                <SearchBar
                    placeholder={intl.formatMessage({
                        id:
                            tabValue === TAB_VALUES.nodes
                                ? 'rootNetwork.searchPlaceholder.nodes'
                                : 'rootNetwork.searchPlaceholder.modifications',
                    })}
                    value={searchTerm}
                    onChange={handleOnChange}
                    onClear={leaveSearch}
                />
            </Box>

            {isLoading && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    {intl.formatMessage({ id: 'rootNetwork.loading' })}
                </Typography>
            )}
            {showResultsCount && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    <FormattedMessage
                        id="rootNetwork.results"
                        values={{
                            count:
                                tabValue === TAB_VALUES.modifications
                                    ? getModificationResultsCount(modificationsResults)
                                    : getNodeResultsCount(nodesResults),
                        }}
                    />
                </Typography>
            )}

            {tabValue === TAB_VALUES.modifications && (
                <RootNetworkModificationsSearchResults results={modificationsResults} />
            )}
            {tabValue === TAB_VALUES.nodes && <RootNetworkNodesSearchResults results={nodesResults} />}
        </Box>
    );
};

export default RootNetworkSearchPanel;
