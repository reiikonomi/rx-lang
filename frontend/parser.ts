import { exitWMessage } from "..";
import {
    AssignmentExpr,
    BinaryExpr,
    CallExpression,
    Expression,
    Identifier,
    MemberExpression,
    NodeType,
    NumericLiteral,
    ObjectLiteral,
    Program,
    Property,
    Statement,
    VarDeclaration
} from "./ast";
import { Token, TokenType, tokenize } from './lexer';



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
        switch (this.at().type) {
            case TokenType.val:
            case TokenType.cval:
                return this.parse_variable_declaration()
            default:
                return this.parse_expression()
        }
    }

    private parse_expression(): Expression {
        return this.parse_assignment_expression();
    }

    private parse_assignment_expression(): Expression {
        const left = this.parse_object_expression();

        if (this.at().type == TokenType.Equals) {
            this.consume(); // advance past equals
            const value = this.parse_assignment_expression();
            return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
        }

        return left;
    }

    private parse_object_expression(): Expression {
        // { Prop[] }
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parse_additive_expression();
        }

        this.consume(); // advance past open brace.
        const properties = new Array<Property>();

        while (this.not_end_of_file() && this.at().type != TokenType.CloseBrace) {
            const key =
                this.expect(TokenType.Identifier, "Object literal key exprected").value;

            // Allows shorthand key: pair -> { key, }
            if (this.at().type == TokenType.Comma) {
                this.consume(); // advance past comma
                properties.push({ key, kind: "Property" } as Property);
                continue;
            } // Allows shorthand key: pair -> { key }
            else if (this.at().type == TokenType.CloseBrace) {
                properties.push({ key, kind: "Property" });
                continue;
            }

            // { key: val }
            this.expect(
                TokenType.Colon,
                "Missing colon following identifier in ObjectExpr",
            );
            const value = this.parse_expression();

            properties.push({ kind: "Property", value, key });
            if (this.at().type != TokenType.CloseBrace) {
                this.expect(
                    TokenType.Comma,
                    "Expected comma or closing bracket following property",
                );
            }
        }

        this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
        return { kind: "ObjectLiteral", properties } as ObjectLiteral;
    }

    // (cval | val) ident;
    // (cval | val) ident = expression
    private parse_variable_declaration(): Expression {
        const isConstant = this.consume().type == TokenType.cval;
        const identifier = this.expect(
            TokenType.Identifier,
            "Expected identifier name following let | const keywords.",
        ).value;

        if (this.at().type == TokenType.Semicolon) {
            this.consume(); // expect semicolon
            if (isConstant) {
                throw "Must assigne value to constant expression. No value provided.";
            }

            return {
                kind: "VarDeclaration",
                identifier,
                constant: false,
            } as VarDeclaration;
        }

        this.expect(
            TokenType.Equals,
            "Expected equals token following identifier in var declaration.",
        );

        const declaration = {
            kind: "VarDeclaration",
            value: this.parse_expression(),
            identifier,
            constant: isConstant,
        } as VarDeclaration;

        this.expect(
            TokenType.Semicolon,
            "Variable declaration statment must end with semicolon.",
        );

        return declaration;
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
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_multiplicative_expression(): Expression {
        let left = this.parse_call_member_expression();
        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.consume().value;
            const right = this.parse_call_member_expression();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr;
        }
        return left!;
    }

    // foo.x()()
    private parse_call_member_expression(): Expression {
        const member = this.parse_member_expression();

        if (this.at().type == TokenType.OpenParen) {
            return this.parse_call_expression(member);
        }

        return member;
    }


    private parse_call_expression(caller: Expression): Expression {
        let call_expr: Expression = {
            kind: "CallExpression",
            caller,
            args: this.parse_args(),
        } as CallExpression;

        if (this.at().type == TokenType.OpenParen) {
            call_expr = this.parse_call_expression(call_expr);
        }

        return call_expr;
    }



    // add( x + 5, y)
    private parse_args(): Expression[] {
        this.expect(TokenType.OpenParen, "Expected open parenthesis");
        const args = this.at().type == TokenType.CloseParen
            ? []
            : this.parse_args_list();

        this.expect(
            TokenType.CloseParen,
            "Missing closing parenthesis inside arguments list",
        );
        return args;
    }


    // foo( x = 5, v = "Bar")
    private parse_args_list(): Expression[] {
        const args = [this.parse_assignment_expression()];

        while (this.at().type == TokenType.Comma && this.consume()) {
            args.push(this.parse_assignment_expression());
        }

        return args;
    }

    private parse_member_expression(): Expression {
        let object = this.parse_primary_expression();

        while (
            this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket
        ) {
            const operator = this.consume();
            let property: Expression;
            let computed: boolean;

            // non-computed values aka obj.expr
            if (operator.type == TokenType.Dot) {
                computed = false;
                // get identifier
                property = this.parse_primary_expression();
                if (property.kind != "Identifier") {
                    throw `Cannonot use dot operator without right hand side being a identifier`;
                }
            } else { // this allows obj[computedValue]
                computed = true;
                property = this.parse_expression();
                this.expect(
                    TokenType.CloseBracket,
                    "Missing closing bracket in computed value.",
                );
            }

            object = {
                kind: "MemberExpression",
                object,
                property,
                computed,
            } as MemberExpression;
        }

        return object;
    }

    // Orders Of Prescidence
    // Assignment
    // Object
    // AdditiveExpr
    // MultiplicitaveExpr
    // Call
    // Member
    // PrimaryExpr


    // Parse literal Values & Grouping Expressions
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