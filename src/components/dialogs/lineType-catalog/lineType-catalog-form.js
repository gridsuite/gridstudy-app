/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid';
import { gridItem } from '../dialogUtils';
import { Button, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { FormattedMessage } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import FloatInput from '../../utils/rhf-inputs/float-input';
import { SEGMENT_DISTANCE_VALUE } from '../../utils/field-constants';

const useStyles = makeStyles((theme) => ({
    label: {
        fontWeight: 'bold',
    },
}));

/**
 * lineSegment definition :
 * {
 *   distance: float
 *   lineType: {
 *     type": "TEST3 789EF",
 *     kind": "AERIAL",
 *     voltage": 225,
 *     conductorType": "CU - Cuivre",
 *     section": 15,
 *     conductorsNumber": 4,
 *     circuitsNumber": 1,
 *     groundWiresNumber": 0,
 *     linearResistance": 0.00009876,
 *     linearReactance": 0.0005,
 *     linearCapacity": 0.000000009
 *   }
 *   resistance: float
 *   reactance: float
 *   susceptance: float
 * }
 *
 */

function toResistance(lineSegment) {
    return lineSegment.distance * lineSegment.lineType.linearResistance;
}

function toReactance(lineSegment) {
    return lineSegment.distance * lineSegment.lineType.linearReactance;
}

function toSusceptance(lineSegment) {
    return (
        (lineSegment.distance *
            lineSegment.lineType.linearCapacity *
            2 *
            Math.PI *
            50 *
            10) ^
        6
    );
}

const LineTypeCatalogForm = (props) => {
    const classes = useStyles();

    const segmentDistanceField = (
        <FloatInput
            name={SEGMENT_DISTANCE_VALUE}
            label={'SegmentDistance'}
            // adornment={meterAdornment}
        />
    );

    const [totalResistance, setTotalResistance] = useState(0);
    const [totalReactance, setTotalReactance] = useState(0);
    const [totalSusceptance, setTotalSusceptance] = useState(0);

    const computeTotals = (array) => {
        const totalResistance = array.reduce(
            (accum, item) => accum + item.resistance,
            0
        );
        const totalReactance = array.reduce(
            (accum, item) => accum + item.reactance,
            0
        );
        const totalSusceptance = array.reduce(
            (accum, item) => accum + item.susceptance,
            0
        );
    };

    const { onEditButtonClick } = props;
    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(),
        [onEditButtonClick]
    );

    return (
        <>
            <Grid container direction="row-reverse" spacing={2}>
                {gridItem(<FormattedMessage id={'SusceptanceLabel'} />, 2)}
                {gridItem(<FormattedMessage id={'Reactor'} />, 2)}
                {gridItem(<FormattedMessage id={'R'} />, 2)}
            </Grid>
            {[0, 1, 2, 3].map((line, index) => (
                <Grid container spacing={2} key={index}>
                    {gridItem(segmentDistanceField, 3)}
                    {gridItem(
                        <div>VALUE : {JSON.stringify(props.value)}</div>,
                        2
                    )}
                    {gridItem(
                        <Button
                            onClick={handleEditButtonClick}
                            startIcon={<EditIcon />}
                        />,
                        1
                    )}
                </Grid>
            ))}

            <Grid container direction="row-reverse" spacing={2}>
                {gridItem(
                    <Typography classeName={classes.label}>
                        {totalSusceptance}
                    </Typography>,
                    2
                )}
                {gridItem(
                    <Typography classeName={classes.label}>
                        {totalReactance}
                    </Typography>,
                    2
                )}
                {gridItem(
                    <Typography classeName={classes.label}>
                        {totalResistance}
                    </Typography>,
                    2
                )}
            </Grid>
        </>
    );
};

LineTypeCatalogForm.propTypes = {};

export default LineTypeCatalogForm;
