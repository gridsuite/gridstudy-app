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
import LineDictionaryForm from './line-dictionary-form';
import { getLineDictionary } from '../../../../utils/rest-api';
import LineDictionarySelectorDialog from './line-dictionary-selector-dialog';

const schema = yup
    .object()
    .shape({
        // [TYPE]: yup.object().nullable().required(),
        // [EQUIPMENT_ID]: yup.string().nullable().required(),
    })
    .required();

const emptyFormData = {
    // [TYPE]: EQUIPMENT_TYPES.LINE,
    // [EQUIPMENT_ID]: null,
};

const LineDictionaryDialog = ({ ...dialogProps }) => {
    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const [lineDictionary, setLineDictionary] = useState([]);
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
        getLineDictionary().then((values) => {
            setLineDictionary(values);
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
                titleId="LineDictionaryDialogTitle"
                {...dialogProps}
            >
                {/* TODO temporary proof of concept for multiple editable lines */}
                {[0, 1, 2, 3].map((line, index) => (
                    <LineDictionaryForm
                        key={'lineDictionary' + index}
                        onEditButtonClick={() => openDictionaryDialog(index)}
                        value={
                            lineValues.has(index) ? lineValues.get(index) : []
                        }
                    />
                ))}
                {openDictionaryDialogIndex !== null && (
                    <LineDictionarySelectorDialog
                        open={true}
                        onClose={onDictionaryDialogClose}
                        rowData={lineDictionary}
                        onSelectLine={onSelectDictionaryLine}
                        titleId={'SelectType'}
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

LineDictionaryDialog.propTypes = {};

export default LineDictionaryDialog;
