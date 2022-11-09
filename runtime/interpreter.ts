import { MAKE_NULL, NumberValue, RuntimeValue, MAKE_NUMBER } from './values';
import {
    AssignmentExpr,
    BinaryExpr,
    Expression,
    Identifier,
    NodeType,
    NumericLiteral,
    ObjectLiteral,
    Program,
    Statement,
    VarDeclaration
} from '../frontend/ast';
import Environment from "./environment";
import { exitWMessage } from '../index';
import { evaluate_program, evaluate_variable_declaration } from "../runtime/eval/statements"
import { evaluate_identifier, evaluate_binary_expression, evaluate_assignment_expression, evaluate_object_expression } from "../runtime/eval/expressions"

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
        case "ObjectLiteral":
            return evaluate_object_expression(astNode as ObjectLiteral, environment);
        case "BinaryExpr":
            return evaluate_binary_expression(astNode as BinaryExpr, environment);
        case "AssignmentExpr":
            return evaluate_assignment_expression(astNode as AssignmentExpr, environment)
        case "Program":
            return evaluate_program(astNode as Program, environment);
        case "VarDeclaration":
            return evaluate_variable_declaration(astNode as VarDeclaration, environment)
        default:
            console.error(`This AST Node has not yet been setup for interpretation.`, astNode);
    }
}