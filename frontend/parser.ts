import { exitWMessage } from "..";
import {
    BinaryExpr,
    Expression,
    Identifier,
    NodeType,
    NumericLiteral,
    Program,
    Statement
} from "./ast";
import { Token, TokenType, tokenize } from "./lexer";



export default class Parser {
    private tokens: Token[] = [];

    private not_end_of_file(): boolean {
        return this.tokens[0].type != TokenType.EOF
    }

    private at() {
        return this.tokens[0] as Token;
    }

    private consume() {
        const previous = this.tokens.shift() as Token;
        return previous;
    }

    private expect(type: TokenType, error: any) {
        const previous = this.tokens.shift() as Token;
        if (!previous || previous.type != type) {
            exitWMessage(`Parser error: \n ${error} ${previous}`, 1)
        }
        return previous;
    }

    public produceAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode);

        const program: Program = {
            kind: 'Program',
            body: []
        };
        // Parse until end of file
        while (this.not_end_of_file()) {
            program.body.push(this.parse_statement())
        }
        return program;
    }

    private parse_statement(): Statement {
        return this.parse_expression()
    }

    private parse_expression(): Expression {
        return this.parse_additive_expression()
    }

    private parse_additive_expression(): Expression {
        let left = this.parse_multiplicative_expression();
        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.consume().value;
            const right = this.parse_multiplicative_expression();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr;
        }
        return left
    }

    private parse_multiplicative_expression(): Expression {
        let left = this.parse_primary_expression();
        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.consume().value;
            const right = this.parse_primary_expression()
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr;
        }
        return left!;
    }


    // Orders Of Prescidence
    // AdditiveExpr
    // MultiplicitaveExpr
    // PrimaryExpr
    private parse_primary_expression(): Expression | undefined {
        const token = this.at().type;

        // Determine which token we are currently at and return literal value
        switch (token) {
            // User defined values.
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.consume().value } as Identifier;

            // Constants and Numeric Constants
            case TokenType.Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.consume().value),
                } as NumericLiteral;

            // Grouping Expressions
            case TokenType.OpenParen: {
                this.consume(); // eat the opening paren
                const value = this.parse_expression();
                this.expect(
                    TokenType.CloseParen,
                    "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
                ); // closing paren
                return value;
            }

            // Unidentified Tokens and Invalid Code Reached
            default:
                exitWMessage("Unexpected token found during parsing!", 1)
        }

    }
}