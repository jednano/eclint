/// <reference path="../typings/tsd.d.ts" />
import chai = require('chai');
export declare var expect: typeof chai.expect;
export declare function createLine(text: string, options?: {
    number?: number;
    offset?: number;
    ending?: string;
}): {
    number: number;
    offset: number;
    text: string;
    ending: string;
};
