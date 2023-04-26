/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
import Grid from '@mui/material/Grid';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { gridItem } from '../dialogUtils';

const LineTypeCatalogForm = (props) => {
    const { onEditButtonClick } = props;
    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(),
        [onEditButtonClick]
    );

    return (
        <>
            <Grid container spacing={2}>
                {/* {gridItem(equipmentTypeField, 6)}*/}
                {gridItem(<div>VALUE : {JSON.stringify(props.value)}</div>, 6)}
                {gridItem(
                    <Button
                        onClick={handleEditButtonClick}
                        startIcon={<EditIcon />}
                    />
                )}
            </Grid>
        </>
    );
};

LineTypeCatalogForm.propTypes = {};

export default LineTypeCatalogForm;
