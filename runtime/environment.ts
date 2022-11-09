import { MAKE_BOOL, MAKE_NULL, MAKE_NUMBER, RuntimeValue } from "./values";
export function setupScope() {
    const environment = new Environment()
    environment.declareVariable("x", MAKE_NUMBER(420), true)
    environment.declareVariable("y", MAKE_NUMBER(69), true)
    environment.declareVariable("warhammer", MAKE_NUMBER(40000), true)
    environment.declareVariable("true", MAKE_BOOL(true), true)
    environment.declareVariable("false", MAKE_BOOL(false), true)
    environment.declareVariable("null", MAKE_NULL(), true)
    return environment;
}
export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeValue>;
    private constants: Set<string>;
    constructor(parentEnv?: Environment) {
        const global = parentEnv ? true : false;
        this.parent = parentEnv;
        this.variables = new Map();
        this.constants = new Set()
    }

    public declareVariable(varname: string, value: RuntimeValue, constant: boolean): RuntimeValue {
        if (this.variables.has(varname)) {
            throw `Cannot declare variable ${varname} as it is already defined`
        }
        this.variables.set(varname, value);
        if (constant) {
            this.constants.add(varname)
        }
        return value;
    }

    public assignVariable(varname: string, value: RuntimeValue): RuntimeValue {
        const environment = this.resolve(varname);

        // Cannot assign to constant variables - cval
        if (environment.constants.has(varname)) {
            throw `Cannot reassign to variable ${varname} as it was declared constant.`;
        }
        environment.variables.set(varname, value);
        return value;
    }

    public lookupVariable(varname: string): RuntimeValue {
        const environment = this.resolve(varname);
        return environment.variables.get(varname) as RuntimeValue;
    }


    public resolve(varname: string): Environment {
        if (this.variables.has(varname)) {
            return this;
        }
        if (this.parent == undefined) {
            throw `Cannot resolve variable ${varname} as it does not exist`;
        }
        return this.parent.resolve(varname);
    }
}