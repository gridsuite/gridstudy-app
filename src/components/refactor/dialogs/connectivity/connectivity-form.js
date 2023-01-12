/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
    fetchVoltageLevels,
} from '../../../../utils/rest-api';
import { useSelector } from 'react-redux';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';

import PositionDiagramPane from '../../../diagrams/singleLineDiagram/position-diagram-pane';
import { IconButton, Tooltip } from '@mui/material';
import { CONNECTION_DIRECTIONS } from '../../../network/constants';
import { useIntl } from 'react-intl';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { useFormContext } from 'react-hook-form';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    VOLTAGE_LEVEL,
} from './connectivity-form-utils';
import TextInput from '../../rhf-inputs/text-input';
import SelectInput from '../../rhf-inputs/select-input';
import IntegerInput from '../../rhf-inputs/integer-input';
import AutocompleteInput from '../../rhf-inputs/autocomplete-input';

/**
 * Hook to handle a 'connectivity value' (voltage level, bus or bus bar section)
 * @param id optional id that has to be defined if the component is used more than once in a form
 * @param direction direction of placement. Either 'row' or 'column', 'row' by default.
 * @param withPosition
 * @param withDirectionsInfos
 * @returns {[{voltageLevel: null, busOrBusbarSection: null},unknown]}
 */
export const ConnectivityForm = ({
    id = CONNECTIVITY,
    direction = 'row',
    withDirectionsInfos = true,
    withPosition = false,
}) => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState(
        []
    );

    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);

    const intl = useIntl();

    const { watch } = useFormContext();

    const {
        id: watchVoltageLevelId,
        topologyKind: watchVoltageLevelTopologyKind,
    } = watch(`${id}.${VOLTAGE_LEVEL}`) || {};

    useEffect(() => {
        fetchVoltageLevels(studyUuid, currentNode?.id).then((values) => {
            setVoltageLevelOptions(
                values.sort((a, b) => a.id.localeCompare(b.id))
            );
        });
    }, [studyUuid, currentNode?.id]);

    useEffect(() => {
        if (watchVoltageLevelId) {
            switch (watchVoltageLevelTopologyKind) {
                case 'NODE_BREAKER':
                    fetchBusbarSectionsForVoltageLevel(
                        studyUuid,
                        currentNode?.id,
                        watchVoltageLevelId
                    ).then((busbarSections) => {
                        setBusOrBusbarSectionOptions(busbarSections);
                    });
                    break;

                case 'BUS_BREAKER':
                    fetchBusesForVoltageLevel(
                        studyUuid,
                        currentNode?.id,
                        watchVoltageLevelId
                    ).then((buses) => setBusOrBusbarSectionOptions(buses));
                    break;

                default:
                    setBusOrBusbarSectionOptions([]);
                    break;
            }
        } else {
            setBusOrBusbarSectionOptions([]);
        }
    }, [
        watchVoltageLevelId,
        watchVoltageLevelTopologyKind,
        studyUuid,
        currentNode?.id,
    ]);

    const areIdsEqual = useCallback((val1, val2) => val1.id === val2.id, []);
    const getObjectId = useCallback((object) => object.id, []);
    const newVoltageLevelField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            name={`${id}.${VOLTAGE_LEVEL}`}
            label="VoltageLevel"
            options={voltageLevelOptions}
            getOptionLabel={getObjectId}
            size={'small'}
        />
    );

    const newBusOrBusbarSectionField = (
        <AutocompleteInput
            allowNewValue
            name={`${id}.${BUS_OR_BUSBAR_SECTION}`}
            label="BusBarBus"
            options={busOrBusbarSectionOptions}
            getOptionLabel={getObjectId}
            isOptionEqualToValue={areIdsEqual}
            size={'small'}
        />
    );

    const newConnectionNameField = (
        <TextInput
            name={`${id}.${CONNECTION_NAME}`}
            label="ConnectionName"
        />
    );

    const newConnectionDirectionField = (
        <SelectInput
            name={`${id}.${CONNECTION_DIRECTION}`}
            label="ConnectionDirection"
            options={CONNECTION_DIRECTIONS}
            fullWidth
            size={'small'}
        />
    );

    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, []);

    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, []);

    const positionIconAdorment = useMemo(
        (isNodeBuilt, clickCallback) => {
            return (
                <IconButton
                    {...(isNodeBuilt && { onClick: clickCallback })}
                    disableRipple={!isNodeBuilt}
                >
                    <Tooltip
                        title={intl.formatMessage({
                            id: isNodeBuilt
                                ? 'DisplayTakenPositions'
                                : 'NodeNotBuildPositionMessage',
                        })}
                    >
                        {isNodeBuilt ? (
                            <ExploreOutlinedIcon color="action" />
                        ) : (
                            <ExploreOffOutlinedIcon color="action" />
                        )}
                    </Tooltip>
                </IconButton>
            );
        },
        [intl]
    );

    const newConnectionPositionField = (
        <IntegerInput
            name={`${id}.${CONNECTION_POSITION}`}
            label="ConnectionPosition"
            customAdornment={positionIconAdorment(
                isNodeBuilt(currentNode),
                handleClickOpenDiagramPane
            )}
            clearable={true}
        />
    );

    const gridSize =
        direction && (direction === 'column' || direction === 'column-reverse')
            ? 12
            : 6;
    const conditionalSize = withPosition && withDirectionsInfos ? 4 : gridSize;
    return (
        <>
            <Grid container direction={direction || 'row'} spacing={2}>
                <Grid item xs={conditionalSize} align="start">
                    {newVoltageLevelField}
                </Grid>
                <Grid item xs={conditionalSize} align="start">
                    {newBusOrBusbarSectionField}
                </Grid>

                {withDirectionsInfos && (
                    <>
                        {withPosition && (
                            <>
                                <Grid item xs={gridSize} align="start" />
                                <Grid item xs={gridSize} align="start" />
                            </>
                        )}
                        <Grid item xs={conditionalSize} align="start">
                            {newConnectionNameField}
                        </Grid>
                        <Grid item xs={conditionalSize} align="start">
                            {newConnectionDirectionField}
                        </Grid>
                        {withPosition && (
                            <>
                                <Grid xs={conditionalSize} item align="start">
                                    {newConnectionPositionField}
                                </Grid>
                            </>
                        )}
                    </>
                )}
            </Grid>
            <PositionDiagramPane
                studyUuid={studyUuid}
                open={isDiagramPaneOpen}
                onClose={handleCloseDiagramPane}
                voltageLevelId={{ id: watchVoltageLevelId }}
                currentNodeUuid={currentNode?.id}
            />
        </>
    );
};
