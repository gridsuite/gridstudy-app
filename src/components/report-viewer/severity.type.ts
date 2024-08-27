export type SeverityFilterConfig = Record<SeverityLevel, boolean>;

export type SeverityLevel = 'UNKNOWN' | 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export type LogSeverity = {
    name: SeverityLevel;
    level: number;
    colorName: string;
    colorHexCode: string;
    displayedByDefault: boolean;
};
