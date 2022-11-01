import { MAKE_NULL, NumberValue, RuntimeValue } from '../values';
import {
    BinaryExpr,
    Identifier,
} from '../../frontend/ast';
import { evaluate } from '../interpreter';
import Environment from "../environment";
/**
 * 
 * @param lhs 
 * @param rhs 
 * @param operator 
 * @returns 
 */
export function evaluate_numeric_binary_expression(
    lhs: NumberValue,
    rhs: NumberValue,
    operator: string,
): NumberValue {
    let result: number;

    if (operator == "+") {
        result = lhs.value + rhs.value;
    } else if (operator == "-") {
        result = lhs.value - rhs.value;
    } else if (operator == "*") {
        result = lhs.value * rhs.value;
    } else if (operator == "/") {
        result = lhs.value / rhs.value;
    } else if (operator == "%") {
        result = lhs.value % rhs.value;
    }

    return { value: result!, type: "number" }
}

/**
 * 
 * @param binop 
 * @param environment 
 * @returns 
 */
export function evaluate_binary_expression(binop: BinaryExpr, environment: Environment): RuntimeValue {
    const lhs = evaluate(binop.left, environment);
    const rhs = evaluate(binop.right, environment);

    // Currently supports only numeric operations
    if (lhs.type == "number" && rhs.type == "number") {
        return evaluate_numeric_binary_expression(
            lhs as NumberValue,
            rhs as NumberValue,
            binop.operator
        )
    }


    // One or both are null
    return MAKE_NULL()
}

/**
 * 
 * @param identifier 
 * @param environment 
 * @returns 
 */
export function evaluate_identifier(
    identifier: Identifier,
    environment: Environment
): RuntimeValue {
    const value = environment.lookupVariable(identifier.symbol);
    return value
}