import { RuntimeValue } from "./values";

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeValue>;
    constructor(parentEnv?: Environment) {
        this.parent = parentEnv;
        this.variables = new Map()
    }

    public declareVariable(varname: string, value: RuntimeValue): RuntimeValue {
        if (this.variables.has(varname)) {
            throw `Cannot declare variable ${varname} as it is already defined`
        }
        this.variables.set(varname, value);
        return value;
    }

    public assignVariable(varname: string, value: RuntimeValue): RuntimeValue {
        const environment = this.resolve(varname);
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