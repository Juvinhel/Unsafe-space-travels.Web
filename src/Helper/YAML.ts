YAML.clone = function (value: any): any
{
    return this.parse(this.stringify(value));
};