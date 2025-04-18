/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { MuiSelectInput } from '@gridsuite/commons-ui';
import { PROVIDER } from '../../../utils/field-constants';
import LineSeparator from '../../commons/line-separator';
import { styles } from '../parameters-style';

export interface ProviderParamProps {
    options: { id: string; label: string }[];
}

export default function ProviderParam({ options }: Readonly<ProviderParamProps>) {
    return (
        <>
            <Grid
                xl={8}
                container
                sx={{
                    height: 'fit-content',
                    justifyContent: 'space-between',
                }}
                paddingRight={1}
            >
                <Grid item xs sx={styles.parameterName}>
                    <FormattedMessage id="Provider" />
                </Grid>
                <Grid item container xs={2} sx={styles.controlItem}>
                    <MuiSelectInput name={PROVIDER} size="small" fullWidth options={options} />
                </Grid>
            </Grid>
            <Grid container paddingTop={1} paddingRight={1} xl={8}>
                <LineSeparator />
            </Grid>
        </>
    );
}
