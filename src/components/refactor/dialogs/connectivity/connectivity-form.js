/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
import {
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
    fetchVoltageLevels,
} from '../../../../utils/rest-api';
import { useSelector } from 'react-redux';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';

import PositionDiagramPane from '../../../diagrams/singleLineDiagram/position-diagram-pane';
import { Tooltip } from '@mui/material';
import { CONNECTION_DIRECTIONS } from '../../../network/constants';
import { useIntl } from 'react-intl';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { useFormContext } from 'react-hook-form';
import yup from '../../utils/yup-config';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    getConnectivityFormValidation,
    VOLTAGE_LEVEL,
} from './connectivity-form-utils';
import { formControlledItem } from '../../utils/form-utils';
import TextInput from '../../inputs/text-input';
import SelectInput from '../../inputs/select-input';
import IntegerInput from '../../inputs/integer-input';
import AutocompleteInput from '../../inputs/autocomplete-input';

/**
 * Hook to handle a 'connectivity value' (voltage level, bus or bus bar section)
 * @param id optional id that has to be defined if the hook is used more than once in a form
 * @param direction direction of placement. Either 'row' or 'column', 'row' by default.
 * @param withPosition
 * @param withDirectionsInfos
 * @returns {[{voltageLevel: null, busOrBusbarSection: null},unknown]}
 */
export const ConnectivityForm = ({
    id,
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

    const methods = useFormContext();
    const { control, watch } = methods;

    const {
        id: watchVoltageLevelId,
        topologyKind: watchVoltageLevelTopologyKind,
    } = watch(`${CONNECTIVITY}.${VOLTAGE_LEVEL}`) || {};

    const connectivityValidation = getConnectivityFormValidation();

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

    const newVoltageLevelField = formControlledItem(
        <AutocompleteInput
            label="VoltageLevel"
            options={voltageLevelOptions}
            getOptionLabel={getObjectId}
            isOptionEqualToValue={areIdsEqual}
            size={'small'}
            isRequired={
                yup.reach(
                    connectivityValidation,
                    `${CONNECTIVITY}.${VOLTAGE_LEVEL}`
                )?.exclusiveTests?.required === true
            }
        />,
        `${CONNECTIVITY}.${VOLTAGE_LEVEL}`,
        control
    );

    const newBusOrBusbarSectionField = formControlledItem(
        <AutocompleteInput
            label="BusBarBus"
            options={busOrBusbarSectionOptions}
            getOptionLabel={getObjectId}
            isOptionEqualToValue={areIdsEqual}
            size={'small'}
            isRequired={
                yup.reach(
                    connectivityValidation,
                    `${CONNECTIVITY}.${BUS_OR_BUSBAR_SECTION}`
                )?.exclusiveTests?.required === true
            }
        />,
        `${CONNECTIVITY}.${BUS_OR_BUSBAR_SECTION}`,
        control
    );

    const newConnectionNameField = formControlledItem(
        <TextInput
            label="ConnectionName"
            isRequired={
                yup.reach(
                    connectivityValidation,
                    `${CONNECTIVITY}.${CONNECTION_NAME}`
                )?.exclusiveTests?.required === true
            }
        />,
        `${CONNECTIVITY}.${CONNECTION_NAME}`,
        control
    );

    const newConnectionDirectionField = formControlledItem(
        <SelectInput
            label="ConnectionDirection"
            options={CONNECTION_DIRECTIONS}
            fullWidth
            isRequired={
                yup.reach(
                    connectivityValidation,
                    `${CONNECTIVITY}.${CONNECTION_DIRECTION}`
                )?.exclusiveTests?.required === true
            }
        />,
        `${CONNECTIVITY}.${CONNECTION_DIRECTION}`,
        control
    );

    const newConnectionPositionField = formControlledItem(
        <IntegerInput
            label="ConnectionPosition"
            isRequired={
                yup.reach(
                    connectivityValidation,
                    `${CONNECTIVITY}.${CONNECTION_POSITION}`
                )?.exclusiveTests?.required === true
            }
        />,
        `${CONNECTIVITY}.${CONNECTION_POSITION}`,
        control
    );

    const gridSize =
        direction && (direction === 'column' || direction === 'column-reverse')
            ? 12
            : 6;

    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, [setIsDiagramPaneOpen]);

    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, [setIsDiagramPaneOpen]);

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
                                <Grid
                                    item
                                    xs={(60 * gridSize) / 100}
                                    align="start"
                                >
                                    {newConnectionPositionField}
                                </Grid>
                                <Grid
                                    item
                                    xs={(5 * gridSize) / 100}
                                    align="start"
                                    display="flex"
                                    alignItems="center"
                                >
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: !isNodeBuilt(currentNode)
                                                ? 'NodeNotBuildPositionMessage'
                                                : 'DisplayTakenPositions',
                                        })}
                                    >
                                        {!isNodeBuilt(currentNode) ? (
                                            <ExploreOffOutlinedIcon color="action" />
                                        ) : (
                                            <ExploreOutlinedIcon
                                                onClick={
                                                    handleClickOpenDiagramPane
                                                }
                                                color="action"
                                                cursor="pointer"
                                            />
                                        )}
                                    </Tooltip>
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
