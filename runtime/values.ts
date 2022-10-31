export type ValueType = "null" | "number" | "boolean";

export interface RuntimeValue {
    type: ValueType;
}

export interface NullValue extends RuntimeValue {
    type: "null";
    value: null;
}

export function MAKE_NULL() {
    return { type: "null", value: null } as NullValue;
}


export interface BooleanValue extends RuntimeValue {
    type: "boolean";
    value: boolean;
}


export function MAKE_BOOL(boolean = true) {
    return { type: "boolean", value: boolean } as BooleanValue;
}


export interface NumberValue extends RuntimeValue {
    type: "number";
    value: number;
}

export function MAKE_NUMBER(number = 100) {
    return { type: "number", value: number } as NumberValue;
}