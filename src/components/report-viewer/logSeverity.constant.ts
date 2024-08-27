import { LogSeverity, SeverityLevel } from './severity.type';

export const LOG_SEVERITY: Record<SeverityLevel, LogSeverity> = {
    UNKNOWN: {
        name: 'UNKNOWN',
        level: 0,
        colorName: 'cornflowerblue',
        colorHexCode: '#6495ED',
        displayedByDefault: false,
    },
    TRACE: {
        name: 'TRACE',
        level: 1,
        colorName: 'SlateGray',
        colorHexCode: '#708090',
        displayedByDefault: false,
    },
    DEBUG: {
        name: 'DEBUG',
        level: 2,
        colorName: 'DarkCyan',
        colorHexCode: '#008B8B',
        displayedByDefault: false,
    },
    INFO: {
        name: 'INFO',
        level: 3,
        colorName: 'mediumseagreen',
        colorHexCode: '#3CB371',
        displayedByDefault: true,
    },
    WARN: {
        name: 'WARN',
        level: 4,
        colorName: 'orange',
        colorHexCode: '#FFA500',
        displayedByDefault: true,
    },
    ERROR: {
        name: 'ERROR',
        level: 5,
        colorName: 'crimson',
        colorHexCode: '#DC143C',
        displayedByDefault: true,
    },
    FATAL: {
        name: 'FATAL',
        level: 6,
        colorName: 'mediumorchid',
        colorHexCode: '#BA55D3',
        displayedByDefault: true,
    },
};
