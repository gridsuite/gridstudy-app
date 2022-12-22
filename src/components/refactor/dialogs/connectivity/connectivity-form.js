/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
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
import * as yup from 'yup';
import ReactHookFormAutocomplete from '../../inputs/select-field/react-hook-form-autocomplete';
import ReactHookFormSelect from '../../inputs/select-field/react-hook-form-select';
import ReactHookFormIntegerNumberTextField from '../../inputs/text-field/react-hook-form-integer-number-text-field';
import ReactHookFormTextField from '../../inputs/text-field/react-hook-form-text-field';
import { getConnectivityFormValidation } from './connectivity-form-utils';

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
    } = watch('connectivity.voltageLevel') || {};

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

    const newVoltageLevelField = (
        <ReactHookFormAutocomplete
            id={id ? id + '/voltage-level' : 'voltage-level'}
            options={voltageLevelOptions}
            name="connectivity.voltageLevel"
            label="VoltageLevel"
            getOptionLabel={(option) => option.id}
            isOptionEqualToValue={(value, option) => value.id === option.id}
            control={control}
            required={
                yup.reach(connectivityValidation, 'connectivity.voltageLevel')
                    ?.exclusiveTests?.required === true
            }
        />
    );

    const newBusOrBusbarSectionField = (
        <ReactHookFormAutocomplete
            id={id ? id + '/bus-bar-bus' : 'bus-bar-bus'}
            options={busOrBusbarSectionOptions}
            name="connectivity.busOrBusbarSection"
            label="BusBarBus"
            getOptionLabel={(option) => option.id}
            isOptionEqualToValue={(value, option) => value.id === option.id}
            control={control}
            required={
                yup.reach(
                    connectivityValidation,
                    'connectivity.busOrBusbarSection'
                )?.exclusiveTests?.required === true
            }
        />
    );

    const newConnectionNameField = (
        <ReactHookFormTextField
            name="connectivity.connectionName"
            label="ConnectionName"
            control={control}
            required={
                yup.reach(connectivityValidation, 'connectivity.connectionName')
                    ?.exclusiveTests?.required === true
            }
        />
    );

    const newConnectionDirectionField = (
        <ReactHookFormSelect
            name="connectivity.connectionDirection"
            label="ConnectionDirection"
            options={CONNECTION_DIRECTIONS}
            size="small"
            fullWidth
            control={control}
            required={
                yup.reach(
                    connectivityValidation,
                    'connectivity.connectionDirection'
                )?.exclusiveTests?.required === true
            }
        />
    );

    const newConnectionPositionField = (
        <ReactHookFormIntegerNumberTextField
            name="connectivity.connectionPosition"
            label="ConnectionPosition"
            control={control}
            required={
                yup.reach(
                    connectivityValidation,
                    'connectivity.connectionPosition'
                )?.exclusiveTests?.required === true
            }
        />
    );

    const gridSize =
        direction && (direction === 'column' || direction === 'column-reverse')
            ? 12
            : 6;

    const handleClickOpenDiagramPane = () => {
        setIsDiagramPaneOpen(true);
    };

    const handleCloseDiagramPane = () => {
        setIsDiagramPaneOpen(false);
    };

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
