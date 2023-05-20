import { Tag } from './tag_interface';

export class BreakComponent implements Tag{
  letter: string = 'br';
  tag: string = '<br>';
  end: string = '';
  hasSeparateEndTag: boolean = false;

  allowedAttributes = []

  getTag(): string {
    return this.tag;
  }

  getEnd(): string {
    return this.end;
  }

  containsAttribute(attrb: string): boolean {
    if (this.allowedAttributes.some(i => i === attrb)) {
      return true;
    }
    return false;
  };
}