/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useEffect, useState } from 'react';
import { SelectChangeEvent, MenuItem, Select } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import { UUID } from 'crypto';

export const RootNetworkSelection: FunctionComponent = () => {
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    // const [rootNetworks, setRootNetworks] = useState<RootNetworkMetadata[]>([]);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const [selectedRootNetworkUuid, setSelectedRootNetworkUuid] = useState<UUID | undefined>(undefined);
    const dispatch = useDispatch();

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
