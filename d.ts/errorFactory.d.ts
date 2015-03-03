export interface ErrorOptions {
    name: string;
}
export declare function create(options: ErrorOptions): (message: string) => void;
