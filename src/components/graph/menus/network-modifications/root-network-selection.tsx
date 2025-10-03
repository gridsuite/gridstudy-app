/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SelectChangeEvent, MenuItem, Select } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import type { UUID } from 'node:crypto';

export const RootNetworkSelection = () => {
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const dispatch = useDispatch();

    const handleRootNetworkChange = (event: SelectChangeEvent<UUID>) => {
        const selectedUuid = event.target.value as UUID;
        dispatch(setCurrentRootNetworkUuid(selectedUuid));
    };

    return (
        <Select
            labelId="root-network-label"
            value={currentRootNetworkUuid ?? ''}
            onChange={handleRootNetworkChange}
            size="small"
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
                    {option.tag}
                </MenuItem>
            ))}
        </Select>
    );
};
