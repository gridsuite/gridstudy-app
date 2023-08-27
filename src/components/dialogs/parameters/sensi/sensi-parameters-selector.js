/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import Grid from '@mui/material/Grid';

import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { Tab, Tabs } from '@mui/material';
import { TabPanel, useStyles } from '../parameters';
import clsx from 'clsx';
import SensiInjectionsSet from './sensi-injections-set';
import SensiInjection from './sensi-injections';
import SensiHVDCs from './sensi-hvdcs';
import SensiPSTs from './sensi-psts';
import SensiNodes from './sensi-nodes';

export const MONITORED_BRANCHES_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.LINE.type,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
];
export const INJECTION_DISTRIBUTION_TYPES = [
    { id: 'PROPORTIONAL', label: 'Proportional' },
    { id: 'PROPORTIONAL_MAXP', label: 'ProportionalMaxP' },
    { id: 'REGULAR', label: 'Regular' },
    { id: 'VENTILATION', label: 'Ventilation' },
];

export const SENSITIVITY_TYPES = [
    { id: 'DELTA_MW', label: 'DeltaMW' },
    { id: 'DELTA_A', label: 'DeltaA' },
];

export const PSTS_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
];

export const MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
];
export const INJECTIONS_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.GENERATOR.type,
    EQUIPMENT_TYPES.LOAD.type,
];

export const EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES = [
    EQUIPMENT_TYPES.GENERATOR.type,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
    EQUIPMENT_TYPES.VSC_CONVERTER_STATION.type,
    EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR.type,
    EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type,
];
export const HVDC_EQUIPMENT_TYPES = [EQUIPMENT_TYPES.HVDC_LINE.type];

const SensiParametersSelector = (props) => {
    const classes = useStyles();
    const TAB_VALUES = {
        SensitivityBranches: 0,
        SensitivityNodes: 1,
    };
    const NESTED_TAB_VALUES = {
        SensiInjectionsSet: 0,
        SensiInjection: 1,
        SensiHVDC: 2,
        SensiPST: 3,
    };
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [tabValue, setTabValue] = useState(TAB_VALUES.SensitivityBranches);
    const [subTabValue, setSubTabValue] = useState(
        NESTED_TAB_VALUES.SensiInjectionsSet
    );
    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);
    const handleSubTabChange = useCallback((event, newValue) => {
        setSubTabValue(newValue);
    }, []);

    const tabInfo = [
        {
            label: 'SensitivityBranches',
            subTabs: [
                { label: 'SensiInjectionsSet' },
                { label: 'SensiInjection' },
                { label: 'SensiHVDC' },
                { label: 'SensiPST' },
            ],
        },
        { label: 'SensitivityNodes' },
    ];
    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[TAB_VALUES.SensitivityBranches] !== undefined) {
            tabsInError.push(TAB_VALUES.SensitivityBranches);
        }
        if (errors?.[TAB_VALUES.SensitivityNodes]) {
            tabsInError.push(TAB_VALUES.SensitivityNodes);
        }
        setTabIndexesWithError(tabsInError);
    };
    const handleClose = () => {
        props.onClose();
        onValidationError();
    };

    const getTabIndicatorClass = useCallback(
        (index) =>
            tabIndexesWithError.includes(index)
                ? {
                      indicator: classes.tabWithErrorIndicator,
                  }
                : {},
        [tabIndexesWithError, classes]
    );

    const getTabClass = useCallback(
        (index) =>
            clsx({
                [classes.tabWithError]: tabIndexesWithError.includes(index),
            }),
        [tabIndexesWithError, classes]
    );

    return (
        <>
            <Grid item maxWidth="md" width="100%">
                <Tabs
                    value={tabValue}
                    variant="scrollable"
                    onChange={handleTabChange}
                    classes={getTabIndicatorClass(tabValue)}
                >
                    {tabInfo.map((tab, index) => (
                        <Tab
                            key={index}
                            label={<FormattedMessage id={tab.label} />}
                            value={tabValue}
                            className={getTabClass(index)}
                        />
                    ))}
                </Tabs>

                {tabInfo.map((tab, index) => (
                    <TabPanel key={index} value={tabValue} index={index}>
                        {tabValue === TAB_VALUES.SensitivityBranches &&
                        tab.subTabs ? (
                            <>
                                <Tabs
                                    value={subTabValue}
                                    variant="scrollable"
                                    onChange={handleSubTabChange}
                                    classes={getTabIndicatorClass(subTabValue)}
                                >
                                    {tab.subTabs.map((subTab, subIndex) => (
                                        <Tab
                                            value={subIndex}
                                            label={
                                                <FormattedMessage
                                                    id={subTab.label}
                                                />
                                            }
                                        ></Tab>
                                    ))}
                                </Tabs>
                                <TabPanel
                                    index={NESTED_TAB_VALUES.SensiInjectionsSet}
                                    value={subTabValue}
                                >
                                    <SensiInjectionsSet />
                                </TabPanel>
                                <TabPanel
                                    index={NESTED_TAB_VALUES.SensiInjection}
                                    value={subTabValue}
                                >
                                    <SensiInjection />
                                </TabPanel>
                                <TabPanel
                                    index={NESTED_TAB_VALUES.SensiHVDC}
                                    value={subTabValue}
                                >
                                    <SensiHVDCs />
                                </TabPanel>
                                <TabPanel
                                    index={NESTED_TAB_VALUES.SensiPST}
                                    value={subTabValue}
                                >
                                    <SensiPSTs />
                                </TabPanel>
                            </>
                        ) : undefined}
                        {tabValue === TAB_VALUES.SensitivityNodes && (
                            <SensiNodes />
                        )}
                    </TabPanel>
                ))}
            </Grid>
        </>
    );
};

export default SensiParametersSelector;
