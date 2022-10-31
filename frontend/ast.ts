// -----------------------------------------------------------
// --------------          AST TYPES        ------------------
// ---     Defines the structure of our languages AST      ---
// -----------------------------------------------------------
export type NodeType =
    | "Program"
    | "NumericLiteral"
    | "Identifier"
    | "BinaryExpr"


/**
 * Statements do not result in a value at runtime.
 They contain one or more expressions internally */
export interface Statement {
    kind: NodeType;
}

/**
 * Defines a block which contains many statements.
 * -  Only one program will be contained in a file.
 */
export interface Program extends Statement {
    kind: "Program",
    body: Statement[]
}


/**  Expressions will result in a value at runtime unlike Statements */
export interface Expression extends Statement { }


/**
 * A operation with two sides seperated by a operator.
 * Both sides can be ANY Complex Expression.
 * - Supported Operators -> + | - | / | * | %
 */
export interface BinaryExpr extends Expression {
    kind: "BinaryExpr",
    left: Expression,
    right: Expression,
    operator: string
}

// LITERAL / PRIMARY EXPRESSION TYPES
/**
 * Represents a user-defined variable or symbol in source.
 */
export interface Identifier extends Expression {
    kind: "Identifier",
    symbol: string
}

/**
 * Represents a numeric constant inside the soure code.
 */
export interface NumericLiteral extends Expression {
    kind: "NumericLiteral",
    value: number
}