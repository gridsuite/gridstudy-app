/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ALL_BUS_BAR_SECTIONS,
    BUS_BAR_INDEX,
    BUSBAR_SECTION_ID,
    IS_AFTER_BUSBAR_SECTION_ID,
    NEW_SWITCH_STATES,
    SWITCH_AFTER_NOT_REQUIRED,
    SWITCH_BEFORE_NOT_REQUIRED,
    SWITCHES_AFTER_SECTIONS,
    SWITCHES_BEFORE_SECTIONS,
} from '../../../../utils/field-constants';
import { Box, Button, Grid, Slider, TextField, Tooltip, Typography } from '@mui/material';
import { filledTextField } from '../../../dialog-utils';
import { FormattedMessage, useIntl } from 'react-intl';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AutocompleteInput, Option, SelectInput, SwitchInput } from '@gridsuite/commons-ui';
import GridSection from '../../../commons/grid-section';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from 'components/grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import type { UUID } from 'node:crypto';
import { POSITION_NEW_SECTION_SIDE, SWITCH_TYPE } from '../../../../network/constants';
import { useFormContext, useWatch } from 'react-hook-form';
import { areIdsEqual, getObjectId } from '../../../../utils/utils';
import { BusBarSections } from './voltage-level-section.type';

const getArrayPosition = (data: BusBarSections, selectedOptionId: string) => {
    if (!selectedOptionId || !data) {
        return { position: -1, length: 0 };
    }

    for (const array of Object.values(data)) {
        if (Array.isArray(array)) {
            const position = array.indexOf(selectedOptionId);
            if (position !== -1) {
                return { position, length: array.length };
            }
        }
    }
    return { position: -1, length: 0 };
};

type OptionWithDisabled = Option & { disabled?: boolean };

interface VoltageLevelSectionsCreationFormProps {
    busBarSectionInfos?: BusBarSections;
    voltageLevelId: string;
    allBusbarSectionsList: string[];
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    isUpdate?: boolean;
    isSymmetricalNbBusBarSections: boolean;
    isNotFoundOrNotSupported: boolean;
}

export function CreateVoltageLevelSectionForm({
    busBarSectionInfos,
    voltageLevelId,
    allBusbarSectionsList,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    isUpdate,
    isSymmetricalNbBusBarSections,
    isNotFoundOrNotSupported,
}: Readonly<VoltageLevelSectionsCreationFormProps>) {
    const intl = useIntl();
    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);
    const [busBarSectionsIdOptions, setBusBarSectionsIdOptions] = useState<Option[]>([]);
    const [isNotRequiredSwitchBefore, setIsNotRequiredSwitchBefore] = useState(false);
    const [isNotRequiredSwitchAfter, setIsNotRequiredSwitchAfter] = useState(false);
    const { setValue } = useFormContext();
    const busbarIndex = useWatch({ name: BUS_BAR_INDEX });
    const selectedOption = useWatch({ name: BUSBAR_SECTION_ID });
    const selectedPositionOption = useWatch({ name: IS_AFTER_BUSBAR_SECTION_ID });
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
    const isNewSwitchOpen = useWatch({ name: NEW_SWITCH_STATES });

    useEffect(() => {
        if (busBarSectionInfos && busbarIndex) {
            const selectedKey = busbarIndex?.id;
            setValue(ALL_BUS_BAR_SECTIONS, false);
            if (selectedKey === 'all') {
                setValue(ALL_BUS_BAR_SECTIONS, true);
                if (allBusbarSectionsList && Array.isArray(allBusbarSectionsList)) {
                    const options = allBusbarSectionsList
                        .filter((id): id is string => Boolean(id))
                        .map((id) => ({
                            id: id,
                            label: id,
                        }));
                    setBusBarSectionsIdOptions(options);
                } else {
                    setBusBarSectionsIdOptions([]);
                }
                return;
            }
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
                }));
            setBusBarSectionsIdOptions(options);
        } else {
            setBusBarSectionsIdOptions([]);
        }
    }, [allBusbarSectionsList, busBarSectionInfos, intl, busbarIndex, setValue]);

    const arrayPosition = useMemo(
        () => busBarSectionInfos && getArrayPosition(busBarSectionInfos, selectedOption?.id),
        [busBarSectionInfos, selectedOption?.id]
    );

    useEffect(() => {
        if (selectedOption && selectedPositionOption && busBarSectionInfos && arrayPosition) {
            const selectedSectionIndex = arrayPosition.position;
            const busBarSections = arrayPosition.length - 1;
            if (selectedSectionIndex === 0 && selectedPositionOption === POSITION_NEW_SECTION_SIDE.BEFORE.id) {
                setValue(SWITCH_BEFORE_NOT_REQUIRED, true);
                setIsNotRequiredSwitchBefore(true);
            } else {
                setValue(SWITCH_BEFORE_NOT_REQUIRED, false);
                setIsNotRequiredSwitchBefore(false);
            }
            if (
                busBarSections === selectedSectionIndex &&
                selectedPositionOption === POSITION_NEW_SECTION_SIDE.AFTER.id
            ) {
                setValue(SWITCH_AFTER_NOT_REQUIRED, true);
                setIsNotRequiredSwitchAfter(true);
            } else {
                setValue(SWITCH_AFTER_NOT_REQUIRED, false);
                setIsNotRequiredSwitchAfter(false);
            }
        }
        if (isUpdate && isNodeBuilt(currentNode)) {
            setValue(SWITCH_AFTER_NOT_REQUIRED, true);
            setValue(SWITCH_BEFORE_NOT_REQUIRED, true);
        }
    }, [selectedOption, setValue, busBarSectionInfos, selectedPositionOption, arrayPosition, isUpdate, currentNode]);

    const busBarIndexOptions = useMemo((): OptionWithDisabled[] => {
        if (busBarSectionInfos) {
            const sortedOptions = Object.keys(busBarSectionInfos || {})
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((key) => ({
                    id: key,
                    label: key,
                }));
            const allOption = {
                id: 'all',
                label: intl.formatMessage({ id: 'allBusbarSections' }),
                disabled: !isSymmetricalNbBusBarSections,
            } as Option & { disabled?: boolean };

            return [...sortedOptions, allOption];
        }
        return [];
    }, [busBarSectionInfos, intl, isSymmetricalNbBusBarSections]);

    const getOptionLabel = (object: string | { id: string | number; label: string | number }) => {
        if (typeof object === 'string') {
            return object;
        }
        if (object?.id === 'all') {
            return intl.formatMessage({ id: 'allBusbarSections' }) ?? '';
        }
        return String(object?.id ?? '');
    };

    const isOptionEqualToValue = (val1: Option, val2: Option) => {
        const getId = (option: Option) => {
            return typeof option === 'string' ? option : String(option?.id ?? '');
        };

        return getId(val1) === getId(val2);
    };

    const handleChangeBusbarIndex = useCallback(() => {
        setValue(BUSBAR_SECTION_ID, null);
    }, [setValue]);

    const busbarCountField = (
        <AutocompleteInput
            name={BUS_BAR_INDEX}
            label="Busbar"
            onChangeCallback={handleChangeBusbarIndex}
            options={busBarIndexOptions as Option[]}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            renderOption={(props, option) => {
                const allOptionsDisabled = (option as any).id === 'all' && (option as any)?.disabled;
                const { key, ...otherProps } = props;
                return (
                    <li key={key} {...otherProps}>
                        <div>
                            <div>{getOptionLabel(option)}</div>
                            {allOptionsDisabled && (
                                <div
                                    style={{
                                        fontSize: '0.85rem',
                                        color: 'red',
                                        marginTop: '2px',
                                    }}
                                >
                                    {intl.formatMessage({ id: 'allOptionHelperText' })}
                                </div>
                            )}
                        </div>
                    </li>
                );
            }}
            getOptionDisabled={(option) => (option as any)?.disabled}
            size={'small'}
            disabled={isNotFoundOrNotSupported}
        />
    );

    const busbarSectionsField = (
        <AutocompleteInput
            name={BUSBAR_SECTION_ID}
            label="BusBarSectionsReference"
            options={busBarSectionsIdOptions}
            getOptionLabel={getObjectId}
            isOptionEqualToValue={areIdsEqual}
            size={'small'}
            disabled={!busbarIndex || isNotFoundOrNotSupported}
        />
    );

    const positionSideNewSectionField = (
        <SelectInput
            name={IS_AFTER_BUSBAR_SECTION_ID}
            label="isAfterBusBarSectionId"
            options={Object.values(POSITION_NEW_SECTION_SIDE)}
            size={'small'}
            disabled={!busbarIndex || isNotFoundOrNotSupported}
        />
    );

    const switchBeforeField = (
        <SelectInput
            name={SWITCHES_BEFORE_SECTIONS}
            label={'switchesBeforeSections'}
            options={Object.values(SWITCH_TYPE)}
            size={'small'}
            disabled={!busbarIndex || isNotRequiredSwitchBefore || isNotFoundOrNotSupported}
        />
    );
    const switchAfterField = (
        <SelectInput
            name={SWITCHES_AFTER_SECTIONS}
            label={'switchesAfterSections'}
            options={Object.values(SWITCH_TYPE)}
            size={'small'}
            disabled={!busbarIndex || isNotRequiredSwitchAfter || isNotFoundOrNotSupported}
        />
    );
    const newSwitchState = (
        <SwitchInput
            name={NEW_SWITCH_STATES}
            label={isNewSwitchOpen ? 'areSwitchesClosed' : 'areSwitchesOpen'}
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
                {isNotFoundOrNotSupported && (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="red">
                            <FormattedMessage id={'notValidVoltageLevel'} />
                        </Typography>
                    </Grid>
                )}
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
                <Grid item xs={12}>
                    {newSwitchState}
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
