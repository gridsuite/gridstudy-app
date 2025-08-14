/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    BUS_BAR_INDEX,
    BUSBAR_SECTION_ID,
    IS_AFTER_BUSBAR_SECTION_ID,
    SWITCHES_AFTER_SECTIONS,
    SWITCHES_BEFORE_SECTIONS,
} from '../../../../utils/field-constants';
import { Box, Button, Grid, Slider, TextField, Tooltip } from '@mui/material';
import { filledTextField } from '../../../dialog-utils';
import { FormattedMessage, useIntl } from 'react-intl';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AutocompleteInput, Option, SelectInput } from '@gridsuite/commons-ui';
import GridSection from '../../../commons/grid-section';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from 'components/diagrams/singleLineDiagram/position-diagram-pane';
import { UUID } from 'crypto';
import { POSITION_NEW_SECTION_SIDE, SWITCH_TYPE } from '../../../../network/constants';
import { useFormContext, useWatch } from 'react-hook-form';
import { BusBarSectionInfos } from './voltage-level-section.type';
import { areIdsEqual, getObjectId } from '../../../../utils/utils';

interface VoltageLevelSectionsCreationFormProps {
    busBarSectionInfos?: BusBarSectionInfos[];
    voltageLevelId: string;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export function CreateVoltageLevelSectionForm({
    busBarSectionInfos,
    voltageLevelId,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
}: Readonly<VoltageLevelSectionsCreationFormProps>) {
    const intl = useIntl();
    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);
    const [busBarSectionsIdOptions, setBusBarSectionsIdOptions] = useState<Option[]>([]);
    const { setValue } = useFormContext();
    const sectionCount = useWatch({ name: BUS_BAR_INDEX });

    const voltageLevelIdField = (
        <TextField
            size="small"
            fullWidth
            label={intl.formatMessage({ id: 'VoltageLevelId' })}
            value={voltageLevelId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    useEffect(() => {
        if (busBarSectionInfos && sectionCount) {
            const selectedKey = sectionCount?.id;
            const sections = busBarSectionInfos[selectedKey];
            if (!sections || !Array.isArray(sections)) {
                setBusBarSectionsIdOptions([]);
                return;
            }
            const options = sections
                .filter((id): id is string => Boolean(id))
                .map((id) => ({
                    id: id,
                    label: id,
                }))
                .sort((a, b) => a.id.localeCompare(b.id));
            setBusBarSectionsIdOptions(options);
        } else {
            setBusBarSectionsIdOptions([]);
        }
    }, [busBarSectionInfos, sectionCount]);

    const busBarIndexOptions = useMemo(() => {
        if (busBarSectionInfos) {
            return Object.keys(busBarSectionInfos || {})
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((key) => ({
                    id: key,
                    label: key,
                }));
        }
        return [];
    }, [busBarSectionInfos]);

    const getOptionLabel = (object: string | { id: string | number }) => {
        return typeof object === 'string' ? object : String(object?.id ?? '');
    };

    const isOptionEqualToValue = (val1: Option, val2: Option) => {
        const getId = (option: Option) => {
            return typeof option === 'string' ? option : String(option?.id ?? '');
        };

        return getId(val1) === getId(val2);
    };

    const handleChange = useCallback(() => {
        setValue(BUSBAR_SECTION_ID, null);
    }, [setValue]);

    const busbarCountField = (
        <AutocompleteInput
            name={BUS_BAR_INDEX}
            label="Busbar"
            onChangeCallback={handleChange}
            options={busBarIndexOptions}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            size={'small'}
        />
    );

    const busbarSectionsField = (
        <AutocompleteInput
            name={BUSBAR_SECTION_ID}
            label="BusBarSections"
            options={Object.values(busBarSectionsIdOptions)}
            getOptionLabel={getObjectId}
            isOptionEqualToValue={areIdsEqual}
            size={'small'}
            disabled={!sectionCount}
        />
    );

    const positionSideNewSectionField = (
        <SelectInput
            name={IS_AFTER_BUSBAR_SECTION_ID}
            label="isAfterBusBarSectionId"
            options={Object.values(POSITION_NEW_SECTION_SIDE)}
            size={'small'}
            disabled={!sectionCount}
        />
    );

    const switchBeforeField = (
        <SelectInput
            name={SWITCHES_BEFORE_SECTIONS}
            label={'switchesBeforeSections'}
            options={Object.values(SWITCH_TYPE)}
            size={'small'}
            disabled={!sectionCount}
        />
    );
    const switchAfterField = (
        <SelectInput
            name={SWITCHES_AFTER_SECTIONS}
            label={'switchesAfterSections'}
            options={Object.values(SWITCH_TYPE)}
            size={'small'}
            disabled={!sectionCount}
        />
    );
    const getLabelDescription = useCallback(() => {
        return intl.formatMessage({ id: 'newSection' });
    }, [intl]);
    const newSectionField = (
        <Slider
            min={0}
            max={3}
            step={0.1}
            value={1.5}
            track={false}
            valueLabelFormat={getLabelDescription}
            valueLabelDisplay="on"
            size="medium"
            disabled
            sx={{
                '& .MuiSlider-thumb': {
                    backgroundColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                        backgroundColor: '#1976d2',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: '#1976d2',
                        color: '#1976d2',
                    },
                },
            }}
        />
    );
    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, []);
    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, []);
    const diagramToolTip = (
        <Tooltip sx={{ paddingLeft: 1 }} title={intl.formatMessage({ id: 'builtNodeTooltipForDiagram' })}>
            <InfoOutlined color="info" fontSize="medium" />
        </Tooltip>
    );
    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            {voltageLevelIdField}
                        </Grid>
                        {isNodeBuilt(currentNode) && (
                            <Grid item xs={12} md={3}>
                                <Button onClick={handleClickOpenDiagramPane} variant="outlined" size="small">
                                    <FormattedMessage id={'CreateCouplingDeviceDiagramButton'} />
                                </Button>
                                {diagramToolTip}
                            </Grid>
                        )}
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <GridSection title="SectionPosition" />
                </Grid>

                <Grid item xs={4}>
                    {busbarCountField}
                </Grid>
                <Grid item xs={4}>
                    {busbarSectionsField}
                </Grid>
                <Grid item xs={4}>
                    {positionSideNewSectionField}
                </Grid>

                <Grid item xs={12}>
                    <GridSection title="Switch" />
                </Grid>

                <Grid item xs={12} sm={4}>
                    {switchBeforeField}
                </Grid>
                <Grid item xs={12} sm={4}>
                    {newSectionField}
                </Grid>
                <Grid item xs={12} sm={4}>
                    {switchAfterField}
                </Grid>
            </Grid>
            <PositionDiagramPane
                studyUuid={studyUuid}
                open={isDiagramPaneOpen}
                onClose={handleCloseDiagramPane}
                voltageLevelId={voltageLevelId}
                currentNodeUuid={currentNode?.id}
                currentRootNetworkUuid={currentRootNetworkUuid}
            />
        </Box>
    );
}
