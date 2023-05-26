import { Tag } from './tag_interface';

export class iFrameComponent implements Tag{
  letter: string = 'iframe';
  tag: string = '<iframe>';
  end: string = '</iframe>';
  hasSeparateEndTag: boolean = true;

  allowedAttributes = ['style', 'width', 'height', 'src']

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