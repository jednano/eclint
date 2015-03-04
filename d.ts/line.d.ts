import Newline = require('./Newline');
export interface LineOptions {
    number?: number;
    bom?: string;
    charset?: string;
    newline?: string;
    text?: string;
}
export declare class Line {
    private _number;
    private _bom;
    private _newline;
    private _text;
    private _charset;
    constructor(raw?: string, options?: LineOptions);
    Number: number;
    BOM: string;
    Charsets: string;
    Text: string;
    Newline: Newline;
    Raw: string;
    private parseLineForText(s);
    toString(): string;
    static InvalidBomError: (message: string) => void;
    static InvalidCharsetError: (message: string) => void;
    static MultipleNewlinesError: (message: string) => void;
}
