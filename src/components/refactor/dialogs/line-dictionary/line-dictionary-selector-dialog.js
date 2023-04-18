/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useRef } from 'react';
import { CustomAGGrid } from '../../../dialogs/custom-aggrid';
import ModificationDialog from '../commons/modificationDialog';
import { SELECTED } from '../../utils/field-constants';
import { FormProvider, useForm } from 'react-hook-form';

const emptyFormData = {
    [SELECTED]: null,
};

const LineDictionarySelectorDialog = (props) => {
    const { onClose, onSelectLine } = props;
    const gridRef = useRef(); // Necessary to call getSelectedRows on aggrid component

    const methods = useForm({
        defaultValues: emptyFormData,
    });
    const { setValue } = methods;

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);
    const handleSubmit = useCallback(
        (formData) => onSelectLine && onSelectLine(formData[SELECTED]),
        [onSelectLine]
    );
    const onSelectionChanged = useCallback(() => {
        const selectedRow = gridRef.current.api.getSelectedRows();
        setValue(SELECTED, selectedRow, { shouldDirty: true });
    }, [setValue]);

    return (
        <FormProvider {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="lg"
                maxHeight="md"
                onClear={handleClear}
                onSave={handleSubmit}
                aria-labelledby="dialog-line-dictionary"
                titleId={props.titleId}
                {...props}
            >
                <div style={{ height: '400px' }}>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={props.rowData}
                        columnDefs={props.columnDefs}
                        rowSelection="single"
                        onSelectionChanged={onSelectionChanged}
                    />
                </div>
            </ModificationDialog>
        </FormProvider>
    );
};

LineDictionarySelectorDialog.propTypes = {};

export default LineDictionarySelectorDialog;
