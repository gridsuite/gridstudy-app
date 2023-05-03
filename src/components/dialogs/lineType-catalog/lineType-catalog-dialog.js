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
    TOTAL_RESISTANCE,
    TOTAL_REACTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import { gridItem } from '../dialogUtils';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only-input';
import { roundToDefaultPrecision } from '../../../utils/rounding';
import ExpandableInput from '../../utils/rhf-inputs/expandable-input';

function toResistance(distance, linearResistance) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearResistance === undefined ||
        isNaN(linearResistance)
    ) {
        return 0;
    }
    return Number(distance) * Number(linearResistance);
}

function toReactance(distance, linearReactance) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearReactance === undefined ||
        isNaN(linearReactance)
    ) {
        return 0;
    }
    return Number(distance) * Number(linearReactance);
}

function toSusceptance(distance, linearCapacity) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearCapacity === undefined ||
        isNaN(linearCapacity)
    ) {
        return 0;
    }
    return (
        Number(distance) *
        Number(linearCapacity) *
        2 *
        Math.PI *
        50 *
        Math.pow(10, 6)
    );
}

const emptyLineSegment = {
    distance: null,
    lineType: null,
    resistance: null,
    reactance: null,
    susceptance: null,
};

const formSchema = yup.object().shape({
    [TOTAL_RESISTANCE]: yup.number().required(),
    [TOTAL_REACTANCE]: yup.number().required(),
    [TOTAL_SUSCEPTANCE]: yup.number().required(),
});

const emptyFormData = {
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
    const [lineSegments, setLineSegments] = useState([]);

    const onCatalogDialogClose = () => {
        setOpenCatalogDialogIndex(null);
    };

    const openCatalogDialog = (index) => {
        setOpenCatalogDialogIndex(index);
    };

    const onSelectCatalogLine = useCallback(
        (selectedLine) => {
            setLineSegments((oldLineSegments) => {
                let currentSegment = oldLineSegments[
                    openCatalogDialogIndex
                ] ?? { ...emptyLineSegment };

                currentSegment['lineType'] = selectedLine[0];
                currentSegment['resistance'] = roundToDefaultPrecision(
                    toResistance(
                        currentSegment['distance'],
                        selectedLine[0].linearResistance
                    )
                );
                currentSegment['reactance'] = roundToDefaultPrecision(
                    toReactance(
                        currentSegment['distance'],
                        selectedLine[0].linearReactance
                    )
                );
                currentSegment['susceptance'] = roundToDefaultPrecision(
                    toSusceptance(
                        currentSegment['distance'],
                        selectedLine[0].linearCapacity
                    )
                );

                let newLineSegments = [...oldLineSegments];
                newLineSegments[openCatalogDialogIndex] = currentSegment;
                return newLineSegments;
            });
        },
        [openCatalogDialogIndex]
    );

    const { reset, setValue } = formMethods;

    // Fetchs the lineType catalog on startup
    useEffect(() => {
        getLineTypeCatalog().then((values) => {
            setLineTypeCatalog(values);
        });
    }, []);

    const handleClear = useCallback(() => {
        reset(emptyFormData);
        setLineSegments([]);
    }, [reset]);

    const handleDelete = useCallback(
        (index) => {
            let arr = [...lineSegments];
            arr.splice(index, 1);
            setLineSegments(arr);
            return true; // Needed to remove the line in ExpandableInput
        },
        [lineSegments]
    );

    // Updates the total values of Resistance, Reactance and Susceptance when the array's values are updated.
    useEffect(() => {
        const totalResistance = lineSegments.reduce(
            (accum, item) => accum + item?.resistance ?? 0,
            0
        );
        const totalReactance = lineSegments.reduce(
            (accum, item) => accum + item?.reactance ?? 0,
            0
        );
        const totalSusceptance = lineSegments.reduce(
            (accum, item) => accum + item?.susceptance ?? 0,
            0
        );
        setValue(
            `${TOTAL_RESISTANCE}`,
            roundToDefaultPrecision(totalResistance),
            { shouldDirty: true }
        );
        setValue(
            `${TOTAL_REACTANCE}`,
            roundToDefaultPrecision(totalReactance),
            { shouldDirty: true }
        );
        setValue(
            `${TOTAL_SUSCEPTANCE}`,
            roundToDefaultPrecision(totalSusceptance),
            { shouldDirty: true }
        );
    }, [setValue, lineSegments]);

    const handleSegmentDistantChange = useCallback((index, newDistance) => {
        setLineSegments((oldLineSegments) => {
            let currentSegment = oldLineSegments[index] ?? {
                ...emptyLineSegment,
            };

            currentSegment['distance'] = newDistance;
            currentSegment['resistance'] = roundToDefaultPrecision(
                toResistance(
                    newDistance,
                    currentSegment.lineType?.linearResistance
                )
            );
            currentSegment['reactance'] = roundToDefaultPrecision(
                toReactance(
                    newDistance,
                    currentSegment.lineType?.linearReactance
                )
            );
            currentSegment['susceptance'] = roundToDefaultPrecision(
                toSusceptance(
                    newDistance,
                    currentSegment.lineType?.linearCapacity
                )
            );

            let newLineSegments = [...oldLineSegments];
            newLineSegments[index] = currentSegment;
            return newLineSegments;
        });
    }, []);

    /**
     * RENDER
     */
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={handleClear}
                aria-labelledby="dialog-lineType-catalog"
                titleId="LineTypeCatalogDialogTitle"
                {...dialogProps}
            >
                <Grid container direction="row-reverse" spacing={2}>
                    {gridItem(
                        <FormattedMessage id={'lineType.susceptanceLabel'} />,
                        3
                    )}
                    {gridItem(
                        <FormattedMessage id={'lineType.reactanceLabel'} />,
                        2
                    )}
                    {gridItem(
                        <FormattedMessage id={'lineType.resistanceLabel'} />,
                        2
                    )}
                    {gridItem(<FormattedMessage id={'lineType.type'} />, 3)}
                </Grid>
                <ExpandableInput
                    name={'lineTypeSegments'}
                    Field={LineTypeCatalogForm}
                    addButtonLabel={'AddSegment'}
                    initialValue={{ ...emptyLineSegment }}
                    fieldProps={{
                        onSegmentDistanceChange: (index, newDistance) =>
                            handleSegmentDistantChange(index, newDistance),
                        onEditButtonClick: (index) => openCatalogDialog(index),
                        lineSegments: lineSegments,
                    }}
                    deleteCallback={handleDelete}
                    numberOfInitialInputs={1}
                />
                <hr />
                <Grid container direction="row-reverse" spacing={2}>
                    {gridItem(
                        <ReadOnlyInput name={`${TOTAL_SUSCEPTANCE}`} />,
                        3
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
                        preselectedRow={
                            lineSegments[openCatalogDialogIndex]?.lineType
                        }
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

LineTypeCatalogDialog.propTypes = {};

export default LineTypeCatalogDialog;
