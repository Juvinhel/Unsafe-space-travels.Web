declare interface YAML
{
  /**
    * Parse an input string into JavaScript.
    *
    * Only supports input consisting of a single YAML document; for multi-document
    * support you should use `YAML.parseAllDocuments`. May throw on error, and may
    * log warnings using `console.warn`.
    *
    * @param str - A string with YAML formatting.
    * @param reviver - A reviver function, as in `JSON.parse()`
    * @param options - Options
    * @returns The value will match the type of the root value of the parsed YAML
    *   document, so Maps become objects, Sequences arrays, and scalars result in
    *   nulls, booleans, numbers and strings.
    */
  parse(src: string, reviver?: Reviver, options?: any): any;

  /**
   * Stringify a value as a YAML document.
   * @param value - Any javascript object or primitive
   * @param replacer - A replacer array or function, as in `JSON.stringify()`
   * @param options - Options
   * @returns Will always include `\n` as the last character, as is expected of YAML documents.
   */
  stringify(value: any, replacer?: Replacer | null, options?: any): string;

  clone<T>(value: T): T;
}
type Replacer = any[] | ((key: any, value: any) => unknown);
type Reviver = (key: unknown, value: unknown) => unknown;
declare var YAML: YAML;