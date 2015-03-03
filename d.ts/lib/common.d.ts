/// <reference path="../../bower_components/dt-node/node.d.ts" />
/// <reference path="../../bower_components/dt-mocha/mocha.d.ts" />
/// <reference path="../../bower_components/dt-sinon/sinon.d.ts" />
/// <reference path="../../bower_components/dt-sinon-chai/sinon-chai.d.ts" />
export declare var expect: (target: any) => SinonExpectShould;
export declare var context: {
    report: (message: string) => void;
};
export declare var reporter: SinonSpy;
