export interface Tag {
  letter: string;
  tag: string;
  end ?: string;
  hasSeparateEndTag: boolean;

  allowedAttributes: Array<string>;

  getTag(): string;
  getEnd(): string;
  containsAttribute(attrb: string): boolean;
}