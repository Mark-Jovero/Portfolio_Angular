import { Component } from '@angular/core';
import { Tag } from './tag_interface';

export class AnchorComponent implements Tag{
  letter: string = 'a';
  tag: string = '<a>';
  end: string = '</a>';
  hasSeparateEndTag: boolean = true;

  allowedAttributes = ['style', 'href']

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