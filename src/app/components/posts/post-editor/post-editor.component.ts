import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoginService } from 'src/app/services/auth/login.service';
import { CookieReadService } from 'src/app/services/cookie/cookie-read.service';
import { PostManagerService } from 'src/app/services/posts/post-manager.service';
import { BACKEND, BACKEND_HOST } from 'src/globals';
import { AnchorComponent } from '../tags/anchor.component';
import { BoldComponent } from '../tags/bold.component';
import { BreakComponent } from '../tags/break.component';
import { DivComponent } from '../tags/div.component';
import { ImageComponent } from '../tags/img.component';
import { Header1Component } from '../tags/header1.component';
import { ItalicsComponent } from '../tags/italics.component';
import { Tag } from '../tags/tag_interface';
import { Router } from '@angular/router';
import { iFrameComponent } from '../tags/iframe.component';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css'],
})
export class PostEditorComponent {

  http = inject(HttpClient)
  ls = inject(LoginService)
  cookieRead = inject(CookieReadService)
  pm = inject(PostManagerService)
  router = inject(Router)
  thumbnailImageSrc: string | undefined;
  thumbnailLoading = false;

  
  thumbnail = ''

  submitInProgress = false;

  html: string = '';
  desc: string = '';
  char_length: number = 150
  img_html: string = '';
  isSelection: boolean | undefined;
  selectionStart: number = 0; 
  selectionEnd: number = 0;

  __reload = false;

  imageUploaded: boolean = false;

  date: Date = new Date();

  hasXSSAlert: boolean = false;

  tags: Array<Tag> = [new iFrameComponent(), new ItalicsComponent(), new BoldComponent(), new DivComponent(), new AnchorComponent(), new BreakComponent(), new ImageComponent(null),
    new Header1Component()];
  tagError: Array<string> = [];

  imageArray: any = [];

  TextEditorForm = new FormGroup({
    Title: new FormControl(),
    TextAreaDesc: new FormControl(),
    TextArea: new FormControl(),
    Meta: new FormControl(),

  });

  async ngOnInit() {

    if (!this.pm.getEditStatus())
      return

    this.TextEditorForm.get("Title")?.setValue(this.pm.getTitle())
    this.TextEditorForm.get("Meta")?.setValue(this.pm.getMeta())
    this.TextEditorForm.get("TextAreaDesc")?.setValue(this.pm.getDescription())
    this.TextEditorForm.get("TextArea")?.setValue(this.pm.getContent().replace(/\<br>/g, '\n'))
    this.thumbnail = this.pm.getThumbnail()
    this.thumbnailImageSrc = this.pm.getThumbnail()
    this.desc = this.pm.getDescription();
    this.html = this.pm.getContent();

    this.onTextAreaDescInputLimiter(undefined)
  }

  /**
   * HANDLES UPLOADING AND DISPLAYING PREVIEW OF THUMBNAIL PHOTO
   * @param event 
   */
  async uploadThumbnailClicked(event: any) {
    let file: File = event.target.files[0]
    let reader = new FileReader();

    reader.addEventListener(
      "load",
      () => {
        this.thumbnailLoading = true;
        let r = this.pm.addImage(undefined, String(reader.result)).then((data) => {
          let parsed = JSON.parse(data);
          console.log(parsed.message.fileName)
          this.thumbnailImageSrc = "https://s3.amazonaws.com/files.portfolio.markjovero.com/files/" + parsed.message.fileName
          this.pm.setThumbnail(this.thumbnailImageSrc)
          this.thumbnailLoading = false;
        });
      },
      false
    );

    reader.readAsDataURL(file)
  }

  /**
   * SUBMITS IMAGE TO BACKEND FOR AWS S3 UPLOAD PREPARATION
   * @param event 
   */
  uploadPhoto(event: any) {
    let file: File = event.target.files[0]
    let reader = new FileReader();

    reader.addEventListener(
      "load",
      () => {
        let r = this.pm.addImage(undefined, String(reader.result)).then((data) => {
          let parsed = JSON.parse(data);
          this.imageArray.push("https://s3.amazonaws.com/files.portfolio.markjovero.com/files/" + parsed.message.fileName)
        });
      },
      false
    );

    reader.readAsDataURL(file)
  }

  /**
   * TODO: MUST BE USED IN HTTPS
   * @param event 
   */
  uploadImageClick(event: any) {
    let element = event.target;
    navigator.clipboard.writeText('1')
    //navigator.clipboard.writeText(element.innerHTML.replace('&lt;', '<').replace('&gt;', '>'));
  }

  /**
   * PERFORMS ANALYSIS OF TEXTAREA AND SUBMITS TO BACKEND IF VALID
   * @returns 
   */
  submitPost() {
    if (!this.isTextClean()) {
      this.html = ''
      return;
    }

    let content = {
      session_cookie: this.cookieRead.read('session_cookie'),
      user_id: this.ls.getUserId(),
      isEdit: this.pm.getEditStatus(),
      fileName: this.pm.getFile(),
      postContent: {
        Title: this.TextEditorForm.get("Title")?.value,
        Meta: this.TextEditorForm.get("Meta")?.value,
        TextArea: this.TextEditorForm.get("TextArea")?.value.replace(/\n/g,'<br>'),
        DescThumbnail: this.thumbnailImageSrc,
        Description: this.TextEditorForm.get("TextAreaDesc")?.value,
      }
    }

    this.submitInProgress = true;
    this.http.post(BACKEND.protected_routes.set.posts, content).subscribe(data => {
      this.submitInProgress = false;
      this.pm.setEdit(false);
      this.router.navigate(['/page/1'])
    });
  }

  /**
   * PERFORMS AN ANALYSIS OF TEXTAREA AND DISPLAYS ITS PREVIEW IF TEXTAREA IS CLEAN
   * @returns 
   */
  previewClicked() {
    if (!this.isTextClean()) {
      this.html = ''
      return;
    }

    this.html = this.TextEditorForm.get('TextArea')?.value.replace(/\n/g,'<br>')+"</div>";
    console.log(this.html)
    this.desc = this.TextEditorForm.get('TextAreaDesc')?.value;

  }

  /**
   * ERASES THE FORM
   * @returns 
   */
  resetClicked() {
    let res_confirmation = confirm('Are you sure you want to reset the editor? All data will be removed.')
    if (!res_confirmation)
      return;

    this.html = '';
    this.TextEditorForm.reset();
  }


  /**
   * WRAPS SELECTED TEXT WITH tag
   * @param tag 
   */
  onTagClick(tag: Tag) {
    if (this.TextEditorForm.get('TextArea')?.value == null) {
      this.TextEditorForm.get('TextArea')?.setValue('');
    }
    let value = this.TextEditorForm.get('TextArea')?.value.toString();

    this.TextEditorForm.get('TextArea')?.setValue(value.substring(0,this.selectionStart) + tag.getTag() + value.substring(this.selectionStart, this.selectionEnd) + tag.getEnd() + value.substring(this.selectionEnd, value.length));

  }


  /**
   * TRACKS POINTER SELECTION, USED TO WRAP SELECTED TEXT IN A TAG
   * @param input 
   * @returns 
   */
  onTextAreaClick(input: any) {
    this.selectionStart = input.srcElement.selectionStart;
    this.selectionEnd = input.srcElement.selectionEnd;
    console.log(this.isSelection + " " + this.selectionStart + " " + this.selectionEnd)
    
    if (this.selectionStart == 0 && this.selectionEnd == 0)
      return;
    
    if (this.selectionStart == this.selectionEnd) {
      this.isSelection = false;
      return;
    }

    this.isSelection = true;

    
  }

  /**
   * TRACKS POINTER SELECTION, USED TO WRAP SELECTED TEXT IN A TAG
   * @param event 
   * @returns 
   */
  catchArrowClicks(event: KeyboardEvent) {
    if (event.key == "ArrowLeft" || event.key == "ArrowRight")
      this.isSelection = false;
    else {
      this.isSelection = true;
      return;
    }
    
    if (event.key == "ArrowLeft") {
      this.selectionStart = this.selectionEnd = this.selectionStart - 1;
    } else if (event.key == "ArrowRight") {
      this.selectionStart = this.selectionEnd = this.selectionStart + 1;
    }
  }

  /**
   * UPDATES MAXIMUM CHAR LIMIT COUNTER FOR DESCRIPTION
   * @param event 
   */
  onTextAreaDescInputLimiter(event: any) {
    let value = this.TextEditorForm.get('TextAreaDesc')?.value.toString();
    this.char_length = 150 - value.length
  }

  /**
   * TRACKS POINTER SELECTION, USED TO WRAP SELECTED TEXT IN A TAG
   * @param event 
   * @returns 
   */
  onTextAreaInput(event: any) {
    let value = this.TextEditorForm.get('TextArea')?.value.toString();

    if (this.selectionStart == this.selectionEnd)
      this.isSelection = false;
  
    if (event.inputType == "deleteContentBackward") {
      
      if (this.isSelection) {
        if (value.length == this.selectionEnd - this.selectionStart)
          this.selectionStart = this.selectionEnd = this.selectionStart-1;
        else
          this.selectionStart = this.selectionEnd = this.selectionStart-2;
        this.isSelection = false;
      } else {
        this.selectionStart = this.selectionStart - 1;
        this.selectionEnd = this.selectionEnd - 1;
      }
    }

    if (this.selectionStart > this.TextEditorForm.get('TextArea')?.value.length)
      return;

    this.selectionStart = this.selectionStart + 1;
    this.selectionEnd = this.selectionEnd + 1;

  }

  /**
   * SCANS TEXTAREA FOR VALID TAGS AND ATTRIBUTES
   * @returns false -> invalid tag/attributes, true -> valid tag/attributes
   */
  isTextClean() {
    let text = this.TextEditorForm.get('TextArea')?.value.replace(/\n/g,'<br>');
    let tag = '';
    let raw_tag = '';
    let attrb = ''
    let foundEqual = false;
    let foundTag = false;
    let foundAttributes = false;
    let tagStart = false;
    let attribute_list: Array<string> = []
    this.tagError = [];

    for (var i = 0; i < text.length; i++) {
      
      if (foundTag && !foundAttributes) { // search attributes
        if (text[i] == ' ' || text[i] == '>' || text[i] == '=') {
          if (attrb != '')
            attribute_list.push(attrb);
          attrb = '';
          if (text[i] == '=')
            foundEqual = true;
          else
            foundEqual = false;

          if (text[i] == '>')
            foundAttributes = true;
        }

        if (!foundEqual && text[i] != ' ') {
          attrb += text[i];
        }

        if (foundEqual && text[i] == ' ') {
          foundEqual = false;
        }
      }
      
      if (text[i] == '<' && text[i+1] != '/') { // search tag
        tag += text[i];
        raw_tag += text[i];
        tagStart = true;
        continue;
      }

      if (foundTag && text[i] == '<') {
        tagStart = false;
      }

      if (tagStart && text[i] == '>') {
        tag += text[i];
        raw_tag += text[i];
        tagStart = false;
        foundTag = true;
        foundAttributes = true;
      } else if (!foundTag && tagStart && text[i] == ' ') {
        foundTag = true;
      }

      if (tagStart) {
        if (text[i] == ' ' && tag == '') {
          continue;
        } else if (text[i] != ' ') {
          if (!foundTag)
            tag += text[i];
          raw_tag += text[i];
        } else if (text[i] == ' ' && tag != '') {
          raw_tag += text[i];
        }
      }


      if (foundTag && foundAttributes) {
        let tag_analysis = this.analyzeTag(raw_tag, tag, attribute_list);

        if (!tag_analysis.isAllowed) {
          this.tagError.push(tag_analysis.error)
        }

        foundTag = false;
        foundAttributes = false;
        foundEqual = false;
        tag = '';
        raw_tag = '';
        attribute_list = [];
        attrb = ''
        tagStart = false;
      }
    }
    if (this.tagError.length > 0)
      return false;
    return true;
  }

  /**
   * CHECKS IF A TAG EXISTS IN ./tags AND HAS VALID ATTRIBUTES
   * @param tag - <TAG>
   * @param raw - <TAG attrb_list>
   * @param attribute_list - attrb_list
   * @returns {isAllowed, error}
   */
  analyzeTag(tag: string, raw: string, attribute_list: Array<string>): {isAllowed: boolean, error: string} {
    let return_body = {
      isAllowed: false,
      error: '',
    };
    let tagFound = false;
    let attributeFound = false;
    let allowedAttribs: Array<string> = [];
    let disallowedAttrib: Array<string> = [];

    this.tags.forEach(_tag => {
      if (raw == _tag.getTag()) {
        allowedAttribs = _tag.allowedAttributes
        tagFound = true;
        if (attribute_list.length > 0) {
          for (var i in attribute_list) {
            let attribute = attribute_list[i];
            if (_tag.containsAttribute(attribute)) {

            } else {
              disallowedAttrib.push(attribute)

            }
          }
        } else {
          attributeFound = true;
        }
      }
    })

    return_body.isAllowed = (disallowedAttrib.length == 0 && tagFound) ? true : false;
    if (!tagFound)
      return_body.error = raw + ' is not allowed.'
    else if (disallowedAttrib.length > 0)
      return_body.error = tag + ' contains disallowed attributes. Remove the following: [' +  disallowedAttrib.toString().replaceAll(',', ', ') + "]." + ' Allowed: [' + allowedAttribs.toString().replaceAll(',', ', ') + "].";
    return return_body;
  }



}
