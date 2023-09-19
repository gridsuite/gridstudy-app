/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import Grid from '@mui/material/Grid';
import { Tab, Tabs } from '@mui/material';
import { TabPanel } from '../parameters';
import { useCreateRowDataSensi } from '../../../../hooks/use-create-row-data-sensi';
import * as sensiParam from './columns-definitions';
import DndTable from '../../../utils/dnd-table/dnd-table';
import {
    SensiHvdcs,
    SensiInjection,
    SensiInjectionsSet,
    SensiNodes,
    SensiPsts,
    TAB_VALUES,
} from './columns-definitions';

const SensiParametersSelector = () => {
    const intl = useIntl();

    const [tabValue, setTabValue] = useState(TAB_VALUES.SensitivityBranches);
    const [subTabValue, setSubTabValue] = useState(
        TAB_VALUES.SensiInjectionsSet
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

    const [rowDataInjectionsSet, useFieldArrayOutputInjectionsSet] =
        useCreateRowDataSensi(sensiParam.SensiInjectionsSet);

    const [rowDataInjections, useFieldArrayOutputInjections] =
        useCreateRowDataSensi(sensiParam.SensiInjection);

    const [rowDataHvdc, useFieldArrayOutputHvdc] = useCreateRowDataSensi(
        sensiParam.SensiHvdcs
    );

    const [rowDataPst, useFieldArrayOutputPst] = useCreateRowDataSensi(
        sensiParam.SensiPsts
    );

    const [rowDataNodes, useFieldArrayOutputNodes] = useCreateRowDataSensi(
        sensiParam.SensiNodes
    );

    const getColumnsDefinition = useCallback(
        (sensiColumns) => {
            if (sensiColumns) {
                return sensiColumns.map((column) => ({
                    ...column,
                    label: intl
                        .formatMessage({ id: column.label })
                        .toUpperCase(),
                }));
            }
            return [];
        },
        [intl]
    );

    return (
        <>
            <Grid maxWidth="md" width="100%">
                <Tabs
                    value={tabValue}
                    variant="scrollable"
                    onChange={handleTabChange}
                >
                    {tabInfo.map((tab, index) => (
                        <Tab
                            key={tab.label}
                            label={<FormattedMessage id={tab.label} />}
                            value={index}
                        />
                    ))}
                </Tabs>

                {tabInfo.map((tab, index) => (
                    <TabPanel
                        key={tab.label}
                        value={tabValue}
                        index={index}
                        sx={{ padding: '0px' }}
                    >
                        {tabValue === TAB_VALUES.SensitivityBranches &&
                        tab.subTabs ? (
                            <>
                                <Tabs
                                    value={subTabValue}
                                    variant="scrollable"
                                    onChange={handleSubTabChange}
                                    sx={{ padding: '0px' }}
                                >
                                    {tab.subTabs.map((subTab, subIndex) => (
                                        <Tab
                                            key={subTab.label}
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
                                    index={TAB_VALUES.SensiInjectionsSet}
                                    value={subTabValue}
                                >
                                    <DndTable
                                        arrayFormName={`${SensiInjectionsSet.name}`}
                                        columnsDefinition={getColumnsDefinition(
                                            sensiParam.COLUMNS_DEFINITIONS_INJECTIONS_SET
                                        )}
                                        useFieldArrayOutput={
                                            useFieldArrayOutputInjectionsSet
                                        }
                                        createRows={rowDataInjectionsSet}
                                        tableHeight={270}
                                        withAddRowsDialog={false}
                                        withLeftButtons={false}
                                    />
                                </TabPanel>
                                <TabPanel
                                    index={TAB_VALUES.SensiInjection}
                                    value={subTabValue}
                                >
                                    <DndTable
                                        arrayFormName={`${SensiInjection.name}`}
                                        columnsDefinition={getColumnsDefinition(
                                            sensiParam.COLUMNS_DEFINITIONS_INJECTIONS
                                        )}
                                        useFieldArrayOutput={
                                            useFieldArrayOutputInjections
                                        }
                                        createRows={rowDataInjections}
                                        tableHeight={270}
                                        withAddRowsDialog={false}
                                        withLeftButtons={false}
                                    />
                                </TabPanel>
                                <TabPanel
                                    index={TAB_VALUES.SensiHVDC}
                                    value={subTabValue}
                                >
                                    <DndTable
                                        arrayFormName={`${SensiHvdcs.name}`}
                                        columnsDefinition={getColumnsDefinition(
                                            sensiParam.COLUMNS_DEFINITIONS_HVDCS
                                        )}
                                        useFieldArrayOutput={
                                            useFieldArrayOutputHvdc
                                        }
                                        createRows={rowDataHvdc}
                                        tableHeight={270}
                                        withAddRowsDialog={false}
                                        withLeftButtons={false}
                                    />
                                </TabPanel>
                                <TabPanel
                                    index={TAB_VALUES.SensiPST}
                                    value={subTabValue}
                                >
                                    <DndTable
                                        arrayFormName={`${SensiPsts.name}`}
                                        columnsDefinition={getColumnsDefinition(
                                            sensiParam.COLUMNS_DEFINITIONS_PSTS
                                        )}
                                        useFieldArrayOutput={
                                            useFieldArrayOutputPst
                                        }
                                        createRows={rowDataPst}
                                        tableHeight={270}
                                        withAddRowsDialog={false}
                                        withLeftButtons={false}
                                    />
                                </TabPanel>
                            </>
                        ) : undefined}
                        {tabValue === TAB_VALUES.SensitivityNodes && (
                            <DndTable
                                arrayFormName={`${SensiNodes.name}`}
                                columnsDefinition={getColumnsDefinition(
                                    sensiParam.COLUMNS_DEFINITIONS_NODES
                                )}
                                useFieldArrayOutput={useFieldArrayOutputNodes}
                                createRows={rowDataNodes}
                                tableHeight={270}
                                withAddRowsDialog={false}
                                withLeftButtons={false}
                            />
                        )}
                    </TabPanel>
                ))}
            </Grid>
        </>
    );
};

export default SensiParametersSelector;
