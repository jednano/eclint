declare class Newline {
    Character: string;
    constructor(Character?: string);
    Name: string;
    Length: number;
    toString(): string;
    static pattern: RegExp;
    static map: {
        lf: string;
        crlf: string;
        cr: string;
        vt: string;
        ff: string;
        nel: string;
        ls: string;
        ps: string;
    };
    static reverseMap: {};
    static chars: any[];
    static InvalidNewlineError: (message: string) => void;
}
export = Newline;
