const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
export class BracesVariableRenderer {
    render(template, variables) {
        return template.replace(VARIABLE_PATTERN, (_, key) => variables[key] ?? '');
    }
}
