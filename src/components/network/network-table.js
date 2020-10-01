/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Network from './network';
import VirtualizedTable from '../util/virtualized-table';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useIntl } from 'react-intl';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

const TABLE_NAMES = [
    'Substations',
    'VoltageLevels',
    'Lines',
    'TwoWindingsTransformers',
    'ThreeWindingsTransformers',
    'Generators',
];

const NetworkTable = (props) => {
    const [tabIndex, setTabIndex] = React.useState(0);

    const intl = useIntl();

    function renderSubstationsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.substations.length}
                rowGetter={({ index }) => props.network.substations[index]}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Country' }),
                        dataKey: 'countryName',
                    },
                ]}
            />
        );
    }

    function renderVoltageLevelsTable() {
        const voltageLevels = props.network.getVoltageLevels();
        return (
            <VirtualizedTable
                rowCount={voltageLevels.length}
                rowGetter={({ index }) => voltageLevels[index]}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'SubstationId' }),
                        dataKey: 'substationId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'NominalVoltage' }),
                        dataKey: 'nominalVoltage',
                        numeric: true,
                    },
                ]}
            />
        );
    }

    function renderLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.lines.length}
                rowGetter={({ index }) => props.network.lines[index]}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                    },
                ]}
            />
        );
    }

    function renderTwoWindingsTransformersTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.twoWindingsTransformers.length}
                rowGetter={({ index }) =>
                    props.network.twoWindingsTransformers[index]
                }
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap' }),
                        dataKey: 'ratioTapChangerPosition',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap' }),
                        dataKey: 'phaseTapChangerPosition',
                        numeric: true,
                    },
                ]}
            />
        );
    }

    function renderThreeWindingsTransformersTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.threeWindingsTransformers.length}
                rowGetter={({ index }) =>
                    props.network.threeWindingsTransformers[index]
                }
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide3',
                        }),
                        dataKey: 'voltageLevelId3',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide3' }),
                        dataKey: 'p3',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide3' }),
                        dataKey: 'q3',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap1' }),
                        dataKey: 'ratioTapChanger1Position',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap2' }),
                        dataKey: 'ratioTapChanger2Position',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap3' }),
                        dataKey: 'ratioTapChanger3Position',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap1' }),
                        dataKey: 'phaseTapChanger1Position',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap2' }),
                        dataKey: 'phaseTapChanger2Position',
                        numeric: true,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap3' }),
                        dataKey: 'phaseTapChanger3Position',
                        numeric: true,
                    },
                ]}
            />
        );
    }

    function renderGeneratorsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.generators.length}
                rowGetter={({ index }) => props.network.generators[index]}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'TargetP' }),
                        dataKey: 'targetP',
                        numeric: true,
                    },
                ]}
            />
        );
    }

    return (
        props.network && (
            <AutoSizer>
                {({ width, height }) => (
                    <div style={{ width: width, height: height - 48 }}>
                        <Tabs
                            value={tabIndex}
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            onChange={(event, newValue) =>
                                setTabIndex(newValue)
                            }
                            aria-label="tables"
                        >
                            {TABLE_NAMES.map((tableName) => (
                                <Tab
                                    label={intl.formatMessage({
                                        id: tableName,
                                    })}
                                />
                            ))}
                        </Tabs>
                        {/*This render is fast, rerender full dom everytime*/}
                        {tabIndex === 0 && renderSubstationsTable()}
                        {tabIndex === 1 && renderVoltageLevelsTable()}
                        {tabIndex === 2 && renderLinesTable()}
                        {tabIndex === 3 && renderTwoWindingsTransformersTable()}
                        {tabIndex === 4 &&
                            renderThreeWindingsTransformersTable()}
                        {tabIndex === 5 && renderGeneratorsTable()}
                    </div>
                )}
            </AutoSizer>
        )
    );
};

NetworkTable.defaultProps = {
    network: null,
};

NetworkTable.propTypes = {
    network: PropTypes.instanceOf(Network),
};

export default NetworkTable;
