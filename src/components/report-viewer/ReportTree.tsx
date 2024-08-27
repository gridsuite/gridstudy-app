import ReportItem from './report-item';
import React from 'react';

import { ReportTree as ReportTreeData } from './reportTreeMapper';

const styles = {
    treeItem: {
        whiteSpace: 'nowrap',
    },
};

interface ReportTreeProps {
    report?: ReportTreeData;
}

export const ReportTree = ({ report }: ReportTreeProps) => {
    console.log(`haha ${JSON.stringify(report)}`);
    console.log(`subreports ${JSON.stringify(report?.subReports)}`);
    return (
        report && (
            <ReportItem
                labelText={report.message}
                labelIconColor={report.highestSeverity.colorName}
                key={report.id}
                sx={styles.treeItem}
                nodeId={report.id}
            >
                {report.subReports.map((value) => {
                    console.log(`value ${JSON.stringify(value)}`);
                    return <ReportTree report={value} />;
                })}
            </ReportItem>
        )
    );
};
