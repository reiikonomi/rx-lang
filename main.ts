import Parser from './frontend/parser';
import Environment from './runtime/environment';
import { evaluate } from './runtime/interpreter';
import { MAKE_BOOL, MAKE_NULL, MAKE_NUMBER } from './runtime/values';
import { exitWMessage } from './index';
import * as fs from "fs"

// repl();

function repl() {
    const parser = new Parser();
    const environment = new Environment();

    // Create default global environment variables
    environment.declareVariable("x", MAKE_NUMBER(420))
    environment.declareVariable("y", MAKE_NUMBER(69))
    environment.declareVariable("warhammer", MAKE_NUMBER(40000))
    environment.declareVariable("true", MAKE_BOOL(true))
    environment.declareVariable("false", MAKE_BOOL(false))
    environment.declareVariable("null", MAKE_NULL())

    // Initialize repl
    console.log(`\nRepl of Rx v0.1`);


    // Continue repl until user stops or types exit
    while (true) {
        const input = prompt("> ");
        // check for user input or exit keyword
        if (!input || input.includes("exit")) {
            exitWMessage("Exited successfully", 1);
        }

        // Produce ast from source code
        const program = parser.produceAST(input!);

        const result = evaluate(program, environment);
        console.log(result)
    }
}

run()
function run() {
    const parser = new Parser()
    const environment = new Environment()
    environment.declareVariable("x", MAKE_NUMBER(420))
    environment.declareVariable("y", MAKE_NUMBER(69))
    environment.declareVariable("warhammer", MAKE_NUMBER(40000))
    environment.declareVariable("true", MAKE_BOOL(true))
    environment.declareVariable("false", MAKE_BOOL(false))
    environment.declareVariable("null", MAKE_NULL())


    let input = prompt("> ")

    if (!input || input.includes("exit")) {
        exitWMessage("Exited successfully", 0)
    }
    else if (input == `rx`) {
        const file = fs.readFileSync("main.rx")

        const program = parser.produceAST(file.toString())

        const result = evaluate(program, environment)

        console.log(result)
    }
}