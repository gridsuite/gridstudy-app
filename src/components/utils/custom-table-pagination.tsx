/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { LabelDisplayedRowsArgs, TablePagination, TablePaginationProps } from '@mui/material';

type CustomTablePaginationProps = TablePaginationProps & {
    labelRowsPerPageId?: string;
};

const CustomTablePagination = (props: CustomTablePaginationProps) => {
    const { labelRowsPerPageId, ...otherProps } = props;
    const intl = useIntl();

    const customLabelDisplayedRows = ({ from, to, count }: LabelDisplayedRowsArgs) => {
        return `${from}-${to} ${intl.formatMessage({
            id: 'muiTablePaginationOfLabel',
        })} ${count}`;
    };

    const customLabelRowsPerPage = intl.formatMessage({
        id: labelRowsPerPageId ?? 'muiTablePaginationLabelRowsPerPage',
    });

    const customLabelNextPage = intl.formatMessage({
        id: 'muiTablePaginationNext',
    });

    const customLabelPreviousPage = intl.formatMessage({
        id: 'muiTablePaginationPrevious',
    });

    const customLabelFirstPage = intl.formatMessage({
        id: 'muiTablePaginationFirst',
    });

    const customLabelLastPage = intl.formatMessage({
        id: 'muiTablePaginationLast',
    });

    return (
        <TablePagination
            component="div"
            showFirstButton={true}
            showLastButton={true}
            labelDisplayedRows={customLabelDisplayedRows}
            labelRowsPerPage={customLabelRowsPerPage}
            getItemAriaLabel={(type) => {
                switch (type) {
                    case 'next':
                        return customLabelNextPage;
                    case 'previous':
                        return customLabelPreviousPage;
                    case 'last':
                        return customLabelLastPage;
                    case 'first':
                        return customLabelFirstPage;
                    default:
                        return '';
                }
            }}
            {...otherProps}
        />
    );
};

export default CustomTablePagination;
