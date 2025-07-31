/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    BUS_BAR_COUNT,
    SECTION_COUNT,
    SWITCHES_AFTER_SECTIONS,
    SWITCHES_BEFORE_SECTIONS,
} from '../../../../utils/field-constants';
import { Box, Button, Grid, Slider, TextField, Tooltip } from '@mui/material';
import { filledTextField } from '../../../dialog-utils';
import { FormattedMessage, useIntl } from 'react-intl';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AutocompleteInput, SelectInput, SliderInput } from '@gridsuite/commons-ui';
import GridSection from '../../../commons/grid-section';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from 'components/diagrams/singleLineDiagram/position-diagram-pane';
import { UUID } from 'crypto';
import { SWITCH_TYPE } from '../../../../network/constants';
import { useFormContext, useWatch } from 'react-hook-form';
import { BusBarSectionInfos } from './voltage-level-section.type';

interface VoltageLevelSectionsCreationFormProps {
    busBarSectionInfos?: BusBarSectionInfos[] | any;
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
    const [maxVertPos, setMaxVertPos] = useState<number>(0);
    const [sliderValue, setSliderValue] = useState(0.5);
    const { setValue } = useFormContext();
    const sectionCount = useWatch({ name: BUS_BAR_COUNT });

    const adjustToNearestPermittedPosition = (value: number | number[]) => {
        if (Number(value) % 1 === 0.5) {
            return value;
        }

        const floor = Math.floor(Number(value));
        const decimal = Number(value) % 1;

        if (decimal < 0.5) {
            return floor === 0 ? 0.5 : floor - 0.5;
        } else if (decimal > 0.5) {
            return floor + 1.5;
        }
        return value;
    };

    const onSliderChange = useCallback(
        (newValue: number | number[]) => {
            const adjustedValue = adjustToNearestPermittedPosition(newValue);
            setSliderValue(adjustedValue as number);
            setValue(SECTION_COUNT, sliderValue);
        },
        [setValue, sliderValue]
    );

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

    const busBarOptions = useMemo(() => {
        if (!busBarSectionInfos) {
            return null;
        }

        const options = Object.keys(busBarSectionInfos)
            .sort((a, b) => {
                const aNum = parseInt(a.split(':')[1]);
                const bNum = parseInt(b.split(':')[1]);
                return aNum - bNum;
            })
            .map((key) => {
                const busbarNumber = key.split(':')[1];
                return {
                    id: key.split(':')[1].toString(),
                    label: intl.formatMessage({ id: 'BusbarNumber' }, { number: busbarNumber }),
                };
            });

        return [
            ...options,
            {
                id: 'all',
                label: intl.formatMessage({ id: 'AllBusbars' }),
            },
        ];
    }, [busBarSectionInfos, intl]);

    const busbarCountField = (
        <AutocompleteInput name={BUS_BAR_COUNT} label="BusBarBus" options={busBarOptions ?? []} size={'small'} />
    );

    useEffect(() => {
        if (!busBarSectionInfos || !sectionCount) {
            setMaxVertPos(1);
            return;
        }

        const fullId = typeof sectionCount === 'object' ? sectionCount.id : sectionCount;
        let newMaxVertPos = 1;
        if (fullId === 'all') {
            const results: { [key: string]: number } = {};
            Object.keys(busBarSectionInfos).forEach((key) => {
                if (key.startsWith('horizPos:')) {
                    const sectionsInGroup = busBarSectionInfos[key];
                    if (Array.isArray(sectionsInGroup) && sectionsInGroup.length > 0) {
                        const vertPositions = sectionsInGroup
                            .map((section) => section?.vertPos || 0)
                            .filter((pos) => pos > 0);

                        if (vertPositions.length > 0) {
                            results[key] = Math.max(...vertPositions);
                        } else {
                            results[key] = 1;
                        }
                    } else {
                        results[key] = 1;
                    }
                }
            });
            newMaxVertPos = Math.max(...Object.values(results));
        } else if (fullId === '1' || fullId === '2') {
            const targetKey = `horizPos:${fullId}`;
            const sectionsInGroup = busBarSectionInfos[targetKey];

            if (Array.isArray(sectionsInGroup) && sectionsInGroup.length > 0) {
                const vertPositions = sectionsInGroup.map((section) => section?.vertPos || 0).filter((pos) => pos > 0);

                if (vertPositions.length > 0) {
                    newMaxVertPos = Math.max(...vertPositions);
                }
            }
        } else {
            let sectionsInGroup = busBarSectionInfos[fullId];
            if (!sectionsInGroup) {
                const numberOnly = fullId.replace('horizPos:', '');
                const reconstructedKey = `horizPos:${numberOnly}`;
                sectionsInGroup = busBarSectionInfos[reconstructedKey];
            }
            if (Array.isArray(sectionsInGroup) && sectionsInGroup.length > 0) {
                const vertPositions = sectionsInGroup.map((section) => section?.vertPos || 0).filter((pos) => pos > 0);
                if (vertPositions.length > 0) {
                    newMaxVertPos = Math.max(...vertPositions);
                }
            }
        }
        setMaxVertPos(newMaxVertPos);
    }, [sectionCount, busBarSectionInfos]);

    const insertionMarks = useMemo(() => {
        const marks = [{ value: 0, label: '' }];
        for (let i = 1; i <= maxVertPos; i++) {
            marks.push({ value: i, label: `Section ${i}` });
        }
        marks.push({ value: maxVertPos + 1, label: '' });
        return marks;
    }, [maxVertPos]);

    const busBarSectionCountField = (
        <SliderInput
            name={SECTION_COUNT}
            valueLabelFormat={intl.formatMessage({ id: 'newSection' })}
            onValueChanged={onSliderChange}
            min={0}
            max={maxVertPos + 1}
            step={0.5}
            marks={insertionMarks}
            valueLabelDisplay="on"
            track={false}
            aria-labelledby="track-false-slider"
            size="medium"
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
    const newSectionField = (
        <Slider
            min={0}
            max={3}
            step={0.1}
            value={1.5}
            track={false}
            aria-labelledby="track-false-slider"
            size="medium"
            disabled={!sectionCount}
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
            <Grid container spacing={3}>
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

                <Grid item xs={12} md={4}>
                    {busbarCountField}
                </Grid>

                <Grid item xs={12}>
                    <GridSection title="SectionPosition" />
                </Grid>

                <Grid item xs={12}>
                    {busBarSectionCountField}
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
