import { Component } from '@angular/core';
import { Tag } from './tag_interface';

export class Header1Component implements Tag{
  letter: string = 'h1';
  tag: string = '<h1>';
  end: string = '</h1>';
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