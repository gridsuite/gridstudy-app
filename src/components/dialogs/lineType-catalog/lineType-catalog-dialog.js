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
import { SEGMENTS, SEGMENT_DISTANCE_VALUE } from '../../utils/field-constants';

const schema = yup
    .array()
    .of(
        yup.object().shape({
            [SEGMENT_DISTANCE_VALUE]: yup.object().nullable().required(),
            // [SEGMENT_LINE_TYPE]: yup.object().shape({
            //     [LINE_TYPE_KIND]: yup.string(),
            // }),
            // [SEGMENT_RESISTANCE]: yup.number().required(),
            // [SEGMENT_REACTANCE]: yup.number().required(),
            // [SEGMENT_SUSCEPTANCE]: yup.number().required(),
        })
    )
    .required();

/*const lineSegmentValidationSchema = () => ({
    [SEGMENTS]: 
*/
const emptyFormData = {
    // [TYPE]: EQUIPMENT_TYPES.LINE,
    // [EQUIPMENT_ID]: null,
};

const LineTypeCatalogDialog = ({ ...dialogProps }) => {
    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const [lineTypeCatalog, setLineTypeCatalog] = useState([]);
    const [openDictionaryDialogIndex, setOpenDictionaryDialogIndex] =
        useState(null);
    const [lineValues, setLineValues] = useState(new Map());

    const onDictionaryDialogClose = () => {
        setOpenDictionaryDialogIndex(null);
    };

    const openDictionaryDialog = (index) => {
        setOpenDictionaryDialogIndex(index);
    };

    const onSelectDictionaryLine = (selectedLine) => {
        setLineValues((prevLineValues) => {
            const nextLineValues = prevLineValues.set(
                openDictionaryDialogIndex,
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

    const onSubmit = useCallback((formData) => {}, []);
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-line-dictionary"
                titleId="LineTypeCatalogDialogTitle"
                {...dialogProps}
            >
                <LineTypeCatalogForm
                    key={'lineDictionary'}
                    onEditButtonClick={(index) => openDictionaryDialog(index)}
                    value={lineValues}
                />
                {openDictionaryDialogIndex !== null && (
                    <LineTypeCatalogSelectorDialog
                        open={true}
                        onClose={onDictionaryDialogClose}
                        rowData={lineTypeCatalog}
                        onSelectLine={onSelectDictionaryLine}
                        titleId={'SelectType'}
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

LineTypeCatalogDialog.propTypes = {};

export default LineTypeCatalogDialog;
