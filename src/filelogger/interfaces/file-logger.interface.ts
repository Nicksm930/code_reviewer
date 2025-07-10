export type ReviewInfo = {
    lineNo: string | number;
    review: string
}
export interface FileLoggerInfo {
    filePath: string,
    content: string | Buffer,
    securityConcerns?: ReviewInfo[],
    improvements?: ReviewInfo[],
    bugs?: ReviewInfo[]
}