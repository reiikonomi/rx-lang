import { MAKE_NULL, RuntimeValue } from '../values';
import {
    Program, VarDeclaration,
} from '../../frontend/ast';
import Environment from "../environment";
import { evaluate } from '../interpreter';

/**
 * 
 * @param program 
 * @param environment 
 * @returns 
 */
export function evaluate_program(program: Program, environment: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = MAKE_NULL();

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, environment);
    }
    return lastEvaluated;
}


export function evaluate_variable_declaration(
    declaration: VarDeclaration,
    environment: Environment
): RuntimeValue {
    const value = declaration.value ? evaluate(declaration.value, environment) : MAKE_NULL();
    return environment.declareVariable(declaration.identifier, value, declaration.constant);
}