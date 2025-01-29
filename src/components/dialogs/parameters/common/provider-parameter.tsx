/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, SelectChangeEvent } from '@mui/material';
import { DropDown } from '../parameters';
import { useCallback } from 'react';

export interface ProviderParameterProps {
    providers: Record<string, string>;
    provider: string | undefined;
    onChangeProvider: (provider: string) => void;
}

export default function ProviderParameter({ providers, provider, onChangeProvider }: Readonly<ProviderParameterProps>) {
    const handleUpdateProvider = useCallback(
        (evt: SelectChangeEvent) => {
            onChangeProvider(evt.target.value);
        },
        [onChangeProvider]
    );

    return (
        <Grid
            xl={8}
            container
            sx={{
                height: 'fit-content',
                justifyContent: 'space-between',
            }}
        >
            {providers && provider && (
                <DropDown value={provider} label="Provider" values={providers} callback={handleUpdateProvider} />
            )}
        </Grid>
    );
}
