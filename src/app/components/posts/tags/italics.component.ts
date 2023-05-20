import { Component } from '@angular/core';
import { Tag } from './tag_interface';

export class ItalicsComponent implements Tag {
  letter: string = 'i';
  tag: string = '<i>';
  end: string = '</i>';
  hasSeparateEndTag: boolean = true;

  allowedAttributes: Array<string> = ['style']

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
