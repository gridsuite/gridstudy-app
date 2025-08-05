/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
    BUS_BAR_COUNT,
    NEW_SWITCH_STATES,
    SWITCHES_AFTER_SECTIONS,
    SWITCHES_BEFORE_SECTIONS,
} from '../../../../utils/field-constants';
import { Box, Button, Grid, Slider, TextField, Tooltip } from '@mui/material';
import { filledTextField } from '../../../dialog-utils';
import { FormattedMessage, useIntl } from 'react-intl';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AutocompleteInput, CheckboxInput, SelectInput } from '@gridsuite/commons-ui';
import GridSection from '../../../commons/grid-section';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from 'components/diagrams/singleLineDiagram/position-diagram-pane';
import { UUID } from 'crypto';
import { SWITCH_TYPE } from '../../../../network/constants';
import { useWatch } from 'react-hook-form';
import { BusBarSectionInfos } from './voltage-level-section.type';
import { SectionPositionSlider } from './section-position-slider';
import { getIdOrValue } from '../../../commons/utils';

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
    const sectionCount = useWatch({ name: BUS_BAR_COUNT });

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

    const getHorizPosWithMaxSections = useCallback(() => {
        if (!busBarSectionInfos) {
            return [];
        }
        let maxSections = 0;
        let horizPosWithMax = null;
        const sortedEntries = Object.entries(busBarSectionInfos)
            .filter(([key]) => key.startsWith('horizPos:'))
            .sort(([keyA], [keyB]) => {
                const numA = parseInt(keyA.split(':')[1]);
                const numB = parseInt(keyB.split(':')[1]);
                return numA - numB;
            });
        sortedEntries.forEach(([key, sections]) => {
            if (Array.isArray(sections)) {
                if (sections.length > maxSections) {
                    maxSections = sections.length;
                    horizPosWithMax = key.split(':')[1];
                }
            }
        });
        return horizPosWithMax;
    }, [busBarSectionInfos]);

    const busbarSectionOptions = useMemo(() => {
        if (!busBarSectionInfos) {
            return [];
        }

        let sectionsToUse = {};

        if (sectionCount === 'all') {
            const horizPosWithMax = getHorizPosWithMaxSections();
            if (horizPosWithMax) {
                const keyWithMax = `horizPos:${horizPosWithMax}`;
                sectionsToUse = { [keyWithMax]: busBarSectionInfos[keyWithMax] };
            }
        } else if (sectionCount) {
            const selectedKey = `horizPos:${sectionCount}`;
            if (busBarSectionInfos[selectedKey]) {
                sectionsToUse = { [selectedKey]: busBarSectionInfos[selectedKey] };
            }
        } else {
            sectionsToUse = {};
        }

        const options: { id: string; label: string; vertPos: number }[] = [];

        Object.entries(sectionsToUse).forEach(([key, sections]) => {
            if (key.startsWith('horizPos:') && Array.isArray(sections)) {
                sections.forEach((section) => {
                    options.push({
                        id: `${section?.id}`,
                        label: `${section?.id}`,
                        vertPos: section.vertPos,
                    });
                });
            }
        });

        return options.sort((a, b) => a.id.localeCompare(b.id));
    }, [busBarSectionInfos, sectionCount, getHorizPosWithMaxSections]);

    const busBarOptions = useMemo(() => {
        if (!busBarSectionInfos) {
            return [];
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
                    id: key.split(':')[1],
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
        <AutocompleteInput
            name={BUS_BAR_COUNT}
            label="BusBarBus"
            options={busBarOptions ?? []}
            inputTransform={(value: any) => busBarOptions?.find((option) => option?.id === value) || value}
            outputTransform={(option: any) => getIdOrValue(option) ?? null}
            size={'small'}
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
    const newSectionField = <Slider min={0} max={3} step={0.1} value={1.5} track={false} size="small" disabled />;
    const newSwitchStatesField = (
        <CheckboxInput name={NEW_SWITCH_STATES} label={'newSwitchStates'} formProps={{ disabled: !sectionCount }} />
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

                <Grid item xs={12} md={4}>
                    {busbarCountField}
                </Grid>

                <Grid item xs={12}>
                    <GridSection title="SectionPosition" />
                </Grid>
                <Grid container justifyContent="center">
                    <Grid item xs={12}>
                        <SectionPositionSlider busbarSectionOptions={busbarSectionOptions} disabled={!sectionCount} />
                    </Grid>
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
                <Grid item xs={12} sm={6}>
                    {newSwitchStatesField}
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
