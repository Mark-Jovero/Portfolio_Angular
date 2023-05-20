import { Component } from '@angular/core';
import { Tag } from './tag_interface';

export class BoldComponent implements Tag{
  letter: string = 'b';
  tag: string = '<b>';
  end: string = '</b>';
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