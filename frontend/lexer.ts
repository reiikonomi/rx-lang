import { exitWMessage } from "../index"
//tokens that the language understands while parsing
export enum TokenType {
    //Literal types
    Number,
    Identifier,
    //Keywords
    // val -> modifiable variable
    val,
    // cval -> constant variable
    cval,
    // gval -> global variable
    gval,
    // fval -> function variable
    fval,
    // lval -> local variable
    /**
     * Can be accessed only in the inner scope of the current environment with the exception of: NO CHILDREN OF THE ENVIRONMENT CAN ACCESS THIS VARIABLE!!!!
     */
    lval,

    // loops are now independent functions
    /**
     * forLoop((index in array), {return index + 1})
     * forLoop((i < 10), {print.line(i)})
     */
    forLoop,
    /**
     * the if else loop is now a function and for each else if there will be a set of parenthesis that take in the condition, the logic and the return value
     * if there are only 2 sets of parenthesis then the function will assume thats its only an if else block, if there are more than 2, then the first will be the if, the last the else and anything in between an else if
     * for example
     *  ifElse(condition: !user, {logic}, user.something)(condition: user, {logic}, user.something)({logic}, null)
     * 
     * you can pass other ifElse-s inside an ifElse, if you dont want an else statement then just pass an empty set of parenthesis
     *      ifElse(condition:!user, {
     *              ifElse(condition: user.name, {logic}, user.name)
     *          }, user.something)()
     */
    ifElse,
    /**     
     *      The first semicolon pair contains the try block logic, the second one contains the catch block logic. If there isn't a set of parenthesis before the catch block then the function assums that
     *      the exception to catch is an error of any type as seen in example 1. 
     *      If there is a set of parenthesis you can manually specify the type of the exception as seen in example 2.
     *      1.
     *      tryCatch({
     *            ifElse(condition:!user, {
     *                  ifElse(condition: user.name, {logic}, user.name)
     *              }, user.something)()
     *          },{
     *            print.error(error)
     *         })
     * 
     *       2.
     *       tryCatch({
     *            ifElse(condition:!user, {
     *                  ifElse(condition: user.name, {logic}, user.name)
     *              }, user.something)()
     *          }, (err: HTTP_EXCEPTION) {
     *            print.error(err)
     *         })
     * 
     */
    tryCatch,
    //functions,
    /**
     *      fun(arg: string, arg1:number, arg3: map, {
     *              
     *          })
     */
    fun,

    //Grouping * Operators
    BinaryOperator,
    Equals,
    OpenParen,
    CloseParen,
    Semicolon,
    EOF, //end of file token
}


/*
  Constant lookup for keywords and known identifiers + symbol
*/
/**
 * 
 */
const KEYWORDS: Record<string, TokenType> = {
    val: TokenType.val,
    cval: TokenType.cval,
    gval: TokenType.gval,
    fval: TokenType.fval,
    lval: TokenType.lval,
    forLoop: TokenType.forLoop,
    ifElse: TokenType.ifElse,
    tryCatch: TokenType.tryCatch,
    fun: TokenType.fun,
}

/**
 *  Represents a single token from the source code
 */
export interface Token {
    value: string, // contains the raw value as seen inside the source code
    type: TokenType // structure
}


/**
 * 
 * @param value : string
 * @param type : @TokenType
 * @returns a token of a given type and value
 */
function token(value: string, type: TokenType): Token {
    return { value, type }
}


/**
 *
 * @param src : string
 * @returns wether the token is from [a-zA-Z]
 */
function isAlpha(src: string) {
    return src.toUpperCase() != src.toLowerCase()
}


/**
 * 
 * @param src : string
 * @returns true if the character is whitespace, false otherwise
 */
function isSkippable(src: string) {
    return src == " " || src == "\n" || src == "\t";
}


/**
 * 
 * @param src : string
 * @returns wether the character is a valid integer -> [0-9]
 */
function isInt(src: string) {
    const c = src.charCodeAt(0);
    const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1]
}


/**
 * 
 * @param sourceCode : string
 * @returns all tokens of the source code
 */
export function tokenize(sourceCode): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    //produce tokens until EOF is reached
    while (src.length > 0) {
        //Begin parsing one character tokens
        if (src[0] == "(") {
            tokens.push(token(src.shift(), TokenType.OpenParen));
        } else if (src[0] == ")") {
            tokens.push(token(src.shift(), TokenType.CloseParen));
        } // Handle Binary operators
        else if (
            src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" ||
            src[0] == "%"
        ) {
            tokens.push(token(src.shift(), TokenType.BinaryOperator))
        } // Handle conditional & assignment tokens
        else if (src[0] == "=") {
            tokens.push(token(src.shift(), TokenType.Equals))
        }
        // handle semicolons
        else if (src[0] == ";") {
            tokens.push(token(src.shift(), TokenType.Semicolon))
        }
        // handle multicharacter keywords, tokens, identifiers
        else {
            // Handle numeric literals -> integers
            if (isInt(src[0])) {
                let num = "";
                while (src.length > 0 && isInt(src[0])) {
                    num += src.shift()
                }
                //append new numeric token
                tokens.push(token(num, TokenType.Number))
            } else if (isAlpha(src[0])) {
                let identifier = "";
                while (src.length > 0 && isAlpha(src[0])) {
                    identifier += src.shift();
                }

                // CHECK FOR RESERVED KEYWORDS
                const reserved = KEYWORDS[identifier];
                // If value is not undefined then the identifier is
                // reconized keyword
                if (typeof reserved == "number") {
                    tokens.push(token(identifier, reserved));
                } else {
                    // Unreconized name must mean user defined symbol.
                    tokens.push(token(identifier, TokenType.Identifier));
                }
            } else if (isSkippable(src[0])) {
                // Skip uneeded chars.
                src.shift();
            } // Handle unreconized characters.
            // TODO: Impliment better errors and error recovery.
            else {
                exitWMessage(`Unreconized character found in source: ${src[0].charCodeAt(0)}, ${src[0]}`, 1);
            }
        }
    }
    tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
    return tokens;
}
