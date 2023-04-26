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

// const schema = yup.object().shape({
//     [SEGMENTS]: yup.array().of(
const schema = yup.object().shape({
    [SEGMENT_DISTANCE_VALUE]: yup.number(),
    // [SEGMENT_LINE_TYPE]: yup.object().shape({
    //     [LINE_TYPE_KIND]: yup.string(),
    // }),
    // [SEGMENT_RESISTANCE]: yup.number().required(),
    // [SEGMENT_REACTANCE]: yup.number().required(),
    // [SEGMENT_SUSCEPTANCE]: yup.number().required(),
    [TOTAL_RESISTANCE]: yup.number().required(),
    [TOTAL_REACTANCE]: yup.number().required(),
    [TOTAL_SUSCEPTANCE]: yup.number().required(),

    // [SEGMENT_REACTANCE]: yup.number().required(),
    // [SEGMENT_SUSCEPTANCE]: yup.number().required(),
});

const emptyFormData = {
    [SEGMENTS]: null,
    [SEGMENT_DISTANCE_VALUE]: 0,
    [TOTAL_RESISTANCE]: 0.206,
    [TOTAL_REACTANCE]: 0.706,
    [TOTAL_SUSCEPTANCE]: 6.472,
    // [EQUIPMENT_ID]: null,
};

const LineTypeCatalogDialog = ({ ...dialogProps }) => {
    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const [lineTypeCatalog, setLineTypeCatalog] = useState([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState(null);
    const [lineValues, setLineValues] = useState(new Map());

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
    };

    const { reset } = methods;

    useEffect(() => {
        getLineTypeCatalog().then((values) => {
            setLineTypeCatalog(values);
        });
    }, []);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                aria-labelledby="dialog-lineType-catalog"
                titleId="LineTypeCatalogDialogTitle"
                {...dialogProps}
            >
                <LineTypeCatalogForm
                    key={'lineDictionary'} // TODO This will be updated soon
                    onEditButtonClick={(index) => openCatalogDialog(index)}
                    value={lineValues}
                />
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
