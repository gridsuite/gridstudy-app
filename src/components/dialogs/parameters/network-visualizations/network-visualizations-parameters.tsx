/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, SyntheticEvent, useCallback, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TabPanel } from '../parameters';
import { SingleLineDiagramParameters, useGetAvailableComponentLibraries } from './single-line-diagram-parameters';
import { NetworkAreaDiagramParameters } from './network-area-diagram-parameters';
import { MapParameters } from './map-parameters';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../appRedux/reducer';

enum TabValue {
    MAP = 'Map',
    SINGLE_LINE_DIAGRAM = 'SingleLineDiagram',
    NETWORK_AREA_DIAGRAM = 'NetworkAreaDiagram',
}

export const NetworkVisualizationsParameters: FunctionComponent = () => {
    const user = useSelector((state: AppState) => state.user);
    const componentLibraries = useGetAvailableComponentLibraries(user);
    const [tabValue, setTabValue] = useState(TabValue.MAP);

    const handleTabChange = useCallback((_: SyntheticEvent, newValue: TabValue) => {
        setTabValue(newValue);
    }, []);

    return (
        <>
            <Tabs value={tabValue} variant="scrollable" onChange={handleTabChange}>
                <Tab label={<FormattedMessage id={'Map'} />} value={TabValue.MAP} />
                <Tab label={<FormattedMessage id={'SingleLineDiagram'} />} value={TabValue.SINGLE_LINE_DIAGRAM} />
                <Tab label={<FormattedMessage id={'NetworkAreaDiagram'} />} value={TabValue.NETWORK_AREA_DIAGRAM} />
            </Tabs>
            <TabPanel value={tabValue} index={TabValue.MAP}>
                <MapParameters />
            </TabPanel>
            <TabPanel value={tabValue} index={TabValue.SINGLE_LINE_DIAGRAM}>
                <SingleLineDiagramParameters componentLibraries={componentLibraries} />
            </TabPanel>
            <TabPanel value={tabValue} index={TabValue.NETWORK_AREA_DIAGRAM}>
                <NetworkAreaDiagramParameters />
            </TabPanel>
        </>
    );
};
