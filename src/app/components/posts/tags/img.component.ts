import { Tag } from "./tag_interface";

export class ImageComponent implements Tag {
  id: number = -1;
  file: File | any = null;
  letter: string = 'img';
  tag: string = '<img>';
  end: string = '';
  hasSeparateEndTag: boolean = false;

  width: string = '100px';
  height: string = '100px';
  left: string = '0';
  top: string = '0';

  constructor(file: File | any) {
    this.file = file;
  }

  allowedAttributes = ['src', 'style', 'width', 'height']

  getTag(): string {
    return this.tag;
  }

  getEnd(): string {
    return this.end;
  }

  getImage() : string {
    return window.URL.createObjectURL(this.file);;
  }

  containsAttribute(attrb: string): boolean {
    if (this.allowedAttributes.some(i => i === attrb)) {
      return true;
    }
    return false;
  };
}