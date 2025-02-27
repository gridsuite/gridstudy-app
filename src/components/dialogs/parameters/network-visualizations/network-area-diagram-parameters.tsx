/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { PARAM_INIT_NAD_WITH_GEO_DATA } from '../../../../utils/config-params';
import { FormattedMessage } from 'react-intl';
import { INIT_NAD_WITH_GEO_DATA, TabValue } from './network-visualizations-utils';
import { SwitchInput } from '@gridsuite/commons-ui';
import { styles } from '../parameters-style';

export const NetworkAreaDiagramParameters = () => {
    return (
        <Grid
            xl={6}
            container
            spacing={1}
            sx={styles.scrollableGrid}
            key={'networkAreaDiagramParameters'}
            marginTop={-3}
            justifyContent={'space-between'}
        >
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={INIT_NAD_WITH_GEO_DATA} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <SwitchInput name={`${TabValue.NETWORK_AREA_DIAGRAM}.${PARAM_INIT_NAD_WITH_GEO_DATA}`} />
            </Grid>
        </Grid>
    );
};
