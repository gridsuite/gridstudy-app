/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { PARAM_INIT_NAD_WITH_GEO_DATA } from '../../../../utils/config-params';
import ParameterLineSwitch from '../widget/parameter-line-switch';
import styles from '../styles';

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
            <ParameterLineSwitch paramNameId={PARAM_INIT_NAD_WITH_GEO_DATA} label="initNadWithGeoData" />
        </Grid>
    );
};
