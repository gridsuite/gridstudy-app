/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import LineTypeCatalogForm from './lineType-catalog-form';
import LineTypeCatalogSelectorDialog from './lineType-catalog-selector-dialog';
import { getLineTypeCatalog } from '../../../utils/rest-api';
import {
    SEGMENTS,
    SEGMENT_DISTANCE_VALUE,
    TOTAL_RESISTANCE,
    TOTAL_REACTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import { gridItem } from '../dialogUtils';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only-input';

const emptyLineSegment = {
    distance: null,
    lineType: null,
    resistance: null,
    reactance: null,
    susceptance: null,
};

const formSchema = yup.object().shape({
    [SEGMENT_DISTANCE_VALUE]: yup.number(),
    [TOTAL_RESISTANCE]: yup.number().required(),
    [TOTAL_REACTANCE]: yup.number().required(),
    [TOTAL_SUSCEPTANCE]: yup.number().required(),
});

const emptyFormData = {
    [SEGMENTS]: null,
    [SEGMENT_DISTANCE_VALUE]: 0,
    [TOTAL_RESISTANCE]: 0,
    [TOTAL_REACTANCE]: 0,
    [TOTAL_SUSCEPTANCE]: 0,
};

const LineTypeCatalogDialog = ({ ...dialogProps }) => {
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const [lineTypeCatalog, setLineTypeCatalog] = useState([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState(null);
    const [lineValues, setLineValues] = useState(new Map());
    // const [lineSegments, setLineSegments] = useState(new Map()); // TODO WIP : will replace lineValues soon

    const onCatalogDialogClose = () => {
        setOpenCatalogDialogIndex(null);
    };

    const openCatalogDialog = (index) => {
        setOpenCatalogDialogIndex(index);
    };

    const onSelectCatalogLine = (selectedLine) => {
        setLineValues((prevLineValues) => {
            const nextLineValues = prevLineValues.set(
                openCatalogDialogIndex,
                selectedLine
            );
            return nextLineValues;
        });

        // setLineSegments((prevLineSegments) => { // TODO WIP : will replace lineValues soon
        //     const prevLineSegment = prevLineSegments.has(openCatalogDialogIndex)
        //         ? prevLineSegments.get(openCatalogDialogIndex)
        //         : emptyLineSegment;
        //
        //     const nextLineSegments = prevLineSegments.set(
        //         openCatalogDialogIndex,
        //         { ...prevLineSegment, lineType: selectedLine }
        //     );
        //     return nextLineSegments;
        // });
    };

    const { reset, setValue } = formMethods;

    useEffect(() => {
        getLineTypeCatalog().then((values) => {
            setLineTypeCatalog(values);
        });
    }, []);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    /**
     * VALUES COMPUTATION
     */

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
        setValue(`${TOTAL_RESISTANCE}`, totalResistance);
        setValue(`${TOTAL_REACTANCE}`, totalReactance);
        setValue(`${TOTAL_SUSCEPTANCE}`, totalSusceptance);
    };

    /**
     * RENDER
     */
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                aria-labelledby="dialog-lineType-catalog"
                titleId="LineTypeCatalogDialogTitle"
                {...dialogProps}
            >
                <Grid container direction="row-reverse" spacing={2}>
                    {gridItem(<FormattedMessage id={'SusceptanceLabel'} />, 2)}
                    {gridItem(<FormattedMessage id={'Reactor'} />, 2)}
                    {gridItem(<FormattedMessage id={'R'} />, 2)}
                </Grid>
                {[0, 1, 2, 3].map((line, index) => (
                    <LineTypeCatalogForm
                        key={'lineTypeCatalog' + index}
                        onEditButtonClick={() => openCatalogDialog(index)}
                        onDeleteButtonClick={() =>
                            alert('delete line ' + index)
                        }
                        value={
                            lineValues.has(index)
                                ? lineValues.get(index)[0]
                                : emptyLineSegment
                        }
                        // segment={ // TODO WIP : will replace lineValues soon
                        //     lineSegments.has(index)
                        //         ? lineSegments.get(index)[0]
                        //         : emptyLineSegment
                        // }
                    />
                ))}
                <hr />
                <Grid container direction="row-reverse" spacing={2}>
                    {gridItem(
                        <ReadOnlyInput name={`${TOTAL_SUSCEPTANCE}`} />,
                        2
                    )}
                    {gridItem(<ReadOnlyInput name={`${TOTAL_REACTANCE}`} />, 2)}
                    {gridItem(
                        <ReadOnlyInput name={`${TOTAL_RESISTANCE}`} />,
                        2
                    )}
                </Grid>

                {openCatalogDialogIndex !== null && (
                    <LineTypeCatalogSelectorDialog
                        open={true}
                        onClose={onCatalogDialogClose}
                        rowData={lineTypeCatalog}
                        onSelectLine={onSelectCatalogLine}
                        titleId={'SelectType'}
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

LineTypeCatalogDialog.propTypes = {};

export default LineTypeCatalogDialog;
