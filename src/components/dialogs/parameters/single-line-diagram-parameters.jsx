/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { getAvailableComponentLibraries } from '../../../services/study';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_SUBSTATION_LAYOUT,
} from '../../../utils/config-params';
import { SubstationLayout } from '../../diagrams/diagram-common';
import { LineSeparator } from '../dialogUtils';
import { styles } from './parameters';
import ParameterLineDropdown from './widget/parameter-line-dropdown';
import ParameterLineSwitch from './widget/parameter-line-switch';

export const useGetAvailableComponentLibraries = (user) => {
    const [componentLibraries, setComponentLibraries] = useState([]);

    useEffect(() => {
        if (user !== null) {
            getAvailableComponentLibraries().then((libraries) => {
                if (libraries != null) {
                    setComponentLibraries(libraries);
                }
            });
        }
    }, [user]);

    return componentLibraries;
};

export const SingleLineDiagramParameters = ({ componentLibraries }) => {
    const componentLibsRenderCache = useMemo(
        () => Object.fromEntries(componentLibraries.filter(Boolean).map((libLabel) => [libLabel, libLabel])),
        [componentLibraries]
    );

    return (
        <>
            <Grid
                xl={6}
                container
                spacing={1}
                sx={styles.scrollableGrid}
                marginTop={-3}
                justifyContent={'space-between'}
            >
                <ParameterLineSwitch paramNameId={PARAM_DIAGONAL_LABEL} label="diagonalLabel" />
                <LineSeparator />
                <ParameterLineSwitch paramNameId={PARAM_CENTER_LABEL} label="centerLabel" />
                <LineSeparator />
                <ParameterLineDropdown
                    paramNameId={PARAM_SUBSTATION_LAYOUT}
                    labelTitle="SubstationLayout"
                    labelValue="substation-layout-select-label"
                    defaultValueIfNull={true}
                    values={{
                        [SubstationLayout.HORIZONTAL]: 'HorizontalSubstationLayout',
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
                <ParameterLineDropdown
                    paramNameId={PARAM_COMPONENT_LIBRARY}
                    labelTitle="ComponentLibrary"
                    labelValue="component-library-select-label"
                    values={componentLibsRenderCache}
                />
            </Grid>
        </>
    );
};

SingleLineDiagramParameters.propTypes = {
    componentLibraries: PropTypes.arrayOf(PropTypes.string),
};
