/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import { Grid, Tab, Tabs } from '@mui/material';
import { TabPanel } from '../parameters';
import { useCreateRowDataSensi } from '../../../../hooks/use-create-row-data-sensi';
import * as nonEvacuatedEnergyParam from './columns-definitions';
import {
    NonEvacuatedEnergyGenerationStages,
    NonEvacuatedEnergyStagesSelection,
    NonEvacuatedEnergyGeneratorsCappings,
    NonEvacuatedEnergyMonitoredBranches,
    NonEvacuatedEnergyContingencies,
    TAB_VALUES,
} from './columns-definitions';
import SensitivityTable from '../sensi/sensitivity-table';
import GeneratorsCappingsThreshold from './generators-cappings-threshold';
import { IColumnsDef } from '../sensi/columns-definitions';

interface NonEvacuatedEnergyParametersSelectorProps {
    onFormChanged: (hasFormChanged: boolean) => void;
    onChangeParams: (a: Record<string, any>, b: string, c: number) => void;
}

const NonEvacuatedEnergyParametersSelector: FunctionComponent<NonEvacuatedEnergyParametersSelectorProps> = ({
    onFormChanged,
    onChangeParams,
}) => {
    const intl = useIntl();

    const [tabValue, setTabValue] = useState(TAB_VALUES.GenerationStages);
    const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, newValue: number) => {
        setTabValue(newValue);
    }, []);

    const tabInfo = [
        { label: 'GenerationStages' },
        { label: 'GeneratorsCappings' },
        { label: 'MonitoredBranches' },
        { label: 'Contingencies' },
    ];

    const [rowDataGenerationStages, useFieldArrayOutputGenerationStages] = useCreateRowDataSensi(
        nonEvacuatedEnergyParam.NonEvacuatedEnergyGenerationStages
    );

    const [rowDataGenerationStagesSelection, useFieldArrayOutputGenerationStagesSelection] = useCreateRowDataSensi(
        nonEvacuatedEnergyParam.NonEvacuatedEnergyStagesSelection
    );

    const [rowDataGeneratorsCappings, useFieldArrayOutputGeneratorsCappings] = useCreateRowDataSensi(
        nonEvacuatedEnergyParam.NonEvacuatedEnergyGeneratorsCappings
    );

    const [rowDataMonitoredBranches, useFieldArrayOutputMonitoredBranches] = useCreateRowDataSensi(
        nonEvacuatedEnergyParam.NonEvacuatedEnergyMonitoredBranches
    );

    const [rowDataContingencies, useFieldArrayOutputContingencies] = useCreateRowDataSensi(
        nonEvacuatedEnergyParam.NonEvacuatedEnergyContingencies
    );

    const getColumnsDefinition = useCallback(
        (columns: IColumnsDef[]) => {
            if (columns) {
                return columns.map((column) => ({
                    ...column,
                    label: intl.formatMessage({ id: column.label }),
                }));
            }
            return [];
        },
        [intl]
    );

    return (
        <>
            <Grid sx={{ width: '100%' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    {tabInfo.map((tab, index) => (
                        <Tab
                            key={tab.label}
                            label={<FormattedMessage id={tab.label} />}
                            value={index}
                            sx={{
                                fontSize: 17,
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                            }}
                        />
                    ))}
                </Tabs>

                {tabInfo.map((tab, index) => (
                    <TabPanel key={tab.label} value={tabValue} index={index}>
                        {tabValue === TAB_VALUES.GenerationStages && (
                            <SensitivityTable
                                arrayFormName={`${NonEvacuatedEnergyGenerationStages.name}`}
                                columnsDefinition={getColumnsDefinition(
                                    nonEvacuatedEnergyParam.COLUMNS_DEFINITIONS_STAGES
                                )}
                                useFieldArrayOutput={useFieldArrayOutputGenerationStages}
                                createRows={rowDataGenerationStages}
                                tableHeight={295}
                                disableAdd={true}
                                disableDelete={true}
                                onFormChanged={onFormChanged}
                                onChangeParams={onChangeParams}
                            />
                        )}

                        {tabValue === TAB_VALUES.GenerationStages && (
                            <SensitivityTable
                                arrayFormName={`${NonEvacuatedEnergyStagesSelection.name}`}
                                columnsDefinition={getColumnsDefinition(
                                    nonEvacuatedEnergyParam.COLUMNS_DEFINITIONS_STAGES_SELECTION
                                )}
                                useFieldArrayOutput={useFieldArrayOutputGenerationStagesSelection}
                                createRows={rowDataGenerationStagesSelection}
                                tableHeight={367}
                                disableAdd={true}
                                disableDelete={true}
                                onFormChanged={onFormChanged}
                                onChangeParams={onChangeParams}
                            />
                        )}

                        {tabValue === TAB_VALUES.GeneratorsCappings && <GeneratorsCappingsThreshold />}

                        {tabValue === TAB_VALUES.GeneratorsCappings && (
                            <SensitivityTable
                                arrayFormName={`${NonEvacuatedEnergyGeneratorsCappings.name}`}
                                columnsDefinition={getColumnsDefinition(
                                    nonEvacuatedEnergyParam.COLUMNS_DEFINITIONS_GENERATORS_CAPPINGS
                                )}
                                useFieldArrayOutput={useFieldArrayOutputGeneratorsCappings}
                                createRows={rowDataGeneratorsCappings}
                                tableHeight={367}
                                onFormChanged={onFormChanged}
                                onChangeParams={onChangeParams}
                            />
                        )}

                        {tabValue === TAB_VALUES.MonitoredBranches && (
                            <SensitivityTable
                                arrayFormName={`${NonEvacuatedEnergyMonitoredBranches.name}`}
                                columnsDefinition={getColumnsDefinition(
                                    nonEvacuatedEnergyParam.COLUMNS_DEFINITIONS_MONITORED_BRANCHES
                                )}
                                useFieldArrayOutput={useFieldArrayOutputMonitoredBranches}
                                createRows={rowDataMonitoredBranches}
                                tableHeight={367}
                                onFormChanged={onFormChanged}
                                onChangeParams={onChangeParams}
                            />
                        )}

                        {tabValue === TAB_VALUES.Contingencies && (
                            <SensitivityTable
                                arrayFormName={`${NonEvacuatedEnergyContingencies.name}`}
                                columnsDefinition={getColumnsDefinition(
                                    nonEvacuatedEnergyParam.COLUMNS_DEFINITIONS_CONTINGENCIES
                                )}
                                useFieldArrayOutput={useFieldArrayOutputContingencies}
                                createRows={rowDataContingencies}
                                tableHeight={367}
                                onFormChanged={onFormChanged}
                                onChangeParams={onChangeParams}
                            />
                        )}
                    </TabPanel>
                ))}
            </Grid>
        </>
    );
};

export default NonEvacuatedEnergyParametersSelector;
