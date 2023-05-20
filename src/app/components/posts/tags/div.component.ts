import { Tag } from './tag_interface';

export class DivComponent implements Tag{
  letter: string = 'div';
  tag: string = '<div>';
  end: string = '</div>';
  hasSeparateEndTag: boolean = true;

  allowedAttributes = ['style']

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