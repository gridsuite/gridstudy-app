/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { SelectChangeEvent, MenuItem, Select } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import { fetchRootNetworks } from 'services/root-network';
import { RootNetworkMetadata } from './network-modification-menu.type';
import { UUID } from 'crypto';

export const RootNetworkSelection: FunctionComponent = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const [rootNetworks, setRootNetworks] = useState<RootNetworkMetadata[]>([]);
    const [selectedRootNetworkUuid, setSelectedRootNetworkUuid] = useState<UUID | undefined>(undefined);
    const dispatch = useDispatch();

    const doFetchRootNetworks = useCallback(() => {
        if (studyUuid) {
            fetchRootNetworks(studyUuid)
                .then((res: RootNetworkMetadata[]) => {
                    setRootNetworks(res);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [studyUuid]);

    useEffect(() => {
        doFetchRootNetworks();
    }, [doFetchRootNetworks]);

    useEffect(() => {
        if (currentRootNetworkUuid) {
            setSelectedRootNetworkUuid(currentRootNetworkUuid);
        }
    }, [currentRootNetworkUuid]);

    const handleRootNetworkChange = (event: SelectChangeEvent<string>) => {
        const selectedUuid = event.target.value as UUID;
        setSelectedRootNetworkUuid(selectedUuid);
        dispatch(setCurrentRootNetworkUuid(selectedUuid));
    };

    return (
        <Select
            labelId="root-network-label"
            value={selectedRootNetworkUuid || ''}
            onChange={handleRootNetworkChange}
            size="small"
            displayEmpty
            renderValue={(selected) => {
                const selectedNetwork = rootNetworks.find((option) => option.rootNetworkUuid === selected);
                return selectedNetwork ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <VisibilityIcon fontSize="small" color="primary" />
                        <FormattedMessage id="visibleRootNetwork" />
                        {selectedNetwork.tag}
                    </span>
                ) : (
                    ''
                );
            }}
        >
            {rootNetworks.map((option) => (
                <MenuItem key={option.rootNetworkUuid} value={option.rootNetworkUuid}>
                    {option.name}
                </MenuItem>
            ))}
        </Select>
    );
};
