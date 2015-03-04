import Newline = require('./Newline');
export interface LineOptions {
    number?: number;
    bom?: string;
    charset?: Charsets;
    newline?: string;
    text?: string;
}
export declare enum Charsets {
    latin1 = 0,
    utf_8 = 1,
    utf_8_bom = 2,
    utf_16be = 3,
    utf_16le = 4,
    utf_32be = 5,
    utf_32le = 6,
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
    Charsets: Charsets;
    Text: string;
    Newline: Newline;
    Raw: string;
    private parseLineForText(s);
    toString(): string;
    static InvalidBomError: (message: string) => void;
    static InvalidCharsetError: (message: string) => void;
    static MultipleNewlinesError: (message: string) => void;
}
