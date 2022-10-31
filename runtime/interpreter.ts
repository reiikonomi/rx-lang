import { MAKE_NULL, NumberValue, RuntimeValue, MAKE_NUMBER } from './values';
import {
    BinaryExpr,
    Expression,
    Identifier,
    NodeType,
    NumericLiteral,
    Program,
    Statement
} from '../frontend/ast';
import Environment from "./environment";
import { exitWMessage } from '../index';


/**
 * 
 * @param program 
 * @param environment 
 * @returns 
 */
function evaluate_program(program: Program, environment: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = MAKE_NULL();

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, environment);
    }
    return lastEvaluated;
}


/**
 * 
 * @param lhs 
 * @param rhs 
 * @param operator 
 * @returns 
 */
function evaluate_numeric_binary_expression(
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

    return { value: result, type: "number" }
}

/**
 * 
 * @param binop 
 * @param environment 
 * @returns 
 */
function evaluate_binary_expression(binop: BinaryExpr, environment: Environment): RuntimeValue {
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
function evaluate_identifier(
    identifier: Identifier,
    environment: Environment
): RuntimeValue {
    try {
        const value = environment.lookupVariable(identifier.symbol);
        return value
    } catch (error) {
        const newvalue = environment.declareVariable(identifier.symbol, MAKE_NUMBER(20));
        return newvalue
    }
}

/**
 * 
 * @param astNode 
 * @param environment 
 * @returns 
 */
export function evaluate(astNode: Statement, environment: Environment): RuntimeValue {
    switch (astNode.kind) {
        case "NumericLiteral":
            return {
                value: ((astNode as NumericLiteral).value),
                type: "number"
            } as NumberValue;
        case "Identifier":
            return evaluate_identifier(astNode as Identifier, environment);
        case "BinaryExpr":
            return evaluate_binary_expression(astNode as BinaryExpr, environment);
        case "Program":
            return evaluate_program(astNode as Program, environment);
        default:
            exitWMessage(`This AST Node has not yet been setup for interpretation. ${astNode}`, 0);
    }
}