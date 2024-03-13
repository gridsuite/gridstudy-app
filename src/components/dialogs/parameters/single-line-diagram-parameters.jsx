/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { SubstationLayout } from '../../diagrams/diagram-common';
import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_COMPONENT_LIBRARY,
} from '../../../utils/config-params';
import { styles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import { getAvailableComponentLibraries } from '../../../services/study';
import { ParamLine, ParameterType } from './widget';

export const useGetAvailableComponentLibraries = (user) => {
    const [componentLibraries, setComponentLibraries] = useState([]);

    useEffect(() => {
        if (user !== null) {
            getAvailableComponentLibraries().then((libraries) => {
                setComponentLibraries(libraries);
            });
        }
    }, [user]);

    return componentLibraries;
};

export const SingleLineDiagramParameters = ({ componentLibraries }) => {
    const componentLibsRenderCache = useMemo(
        () =>
            Array.from(componentLibraries).reduce(
                (prev, val, idx) => ({ ...prev, [val]: val }),
                {},
            ),
        [componentLibraries],
    );

    return (
        <>
            <Grid
                xl={6}
                container
                spacing={1}
                sx={styles.scrollableGrid}
                key={'sldParameters'}
                marginTop={-3}
            >
                <ParamLine
                    type={ParameterType.Switch}
                    param_name_id={PARAM_DIAGONAL_LABEL}
                    label="diagonalLabel"
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.Switch}
                    param_name_id={PARAM_CENTER_LABEL}
                    label="centerLabel"
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.DropDown}
                    param_name_id={PARAM_SUBSTATION_LAYOUT}
                    labelTitle="SubstationLayout"
                    labelValue="substation-layout-select-label"
                    defaultValueIfNull={true}
                    values={{
                        [SubstationLayout.HORIZONTAL]:
                            'HorizontalSubstationLayout',
                        [SubstationLayout.VERTICAL]: 'VerticalSubstationLayout',
                        // the following layouts are not yet supported
                        //[SubstationLayout.SMART]: 'SmartSubstationLayout',
                        //[SubstationLayout.SMARTHORIZONTALCOMPACTION]:
                        //'SmartWithHorizontalCompactionSubstationLayout',
                        //[SubstationLayout.SMARTVERTICALCOMPACTION]:
                        //'SmartWithVerticalCompactionSubstationLayout',
                    }}
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.DropDown}
                    param_name_id={PARAM_COMPONENT_LIBRARY}
                    labelTitle="ComponentLibrary"
                    labelValue="component-library-select-label"
                    values={componentLibsRenderCache}
                />
            </Grid>
        </>
    );
};
