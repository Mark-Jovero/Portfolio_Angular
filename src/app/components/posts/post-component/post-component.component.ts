import { Location } from '@angular/common';
import { Attribute, Component, inject, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';
import { PostManagerService } from 'src/app/services/posts/post-manager.service';

@Component({
  selector: 'app-post-component',
  templateUrl: './post-component.component.html',
  styleUrls: ['./post-component.component.css']
})
export class PostComponentComponent {

  pm = inject(PostManagerService)
  ls = inject(LoginService)
  router = inject(Router)
  loc = inject(Location)

  @Input() isLoaded!: string | boolean;
  @Input() index!: string;
  @Input() title!: string;
  @Input() meta!: string | undefined;
  @Input() description!: string;
  @Input() content!: string;
  @Input() date!: string;
  @Input() etag!: string;
  @Input() file!: string;
  @Input() opened!: string;
  @Input() descImage!: string;

  isLoggedIn = false;
  parsedOpened = false;
  title_style: string = "";
  date_style: string = "";
  meta_style: string = "";
  content_style: string = "";
  thumbnail_style: string = "";
  thumbnail_container_style: string = "";
  
  deleteInProgress = false;


  ngOnInit() {
    this.isLoggedIn = this.ls.isLoggedIn
    this.parsedOpened = this.opened === 'true';
    this.isLoaded = this.isLoaded == 'true' ? true : false;

    if (this.isLoaded) {
      this.title_style="title";
      this.date_style="date"
      this.meta_style="meta"
      this.content_style="content"
      this.thumbnail_style="thumbnail_img"
      this.thumbnail_container_style="thumbnail_c"
    }
    else {
      this.title_style="title_loading";
      this.date_style="date_loading"
      this.meta_style="meta_loading"
      this.content_style="content_loading"
      this.thumbnail_style="thumbnail_img_loading"
      this.thumbnail_container_style="thumbnail_c_loading"
    }
    if (this.meta == '')
      this.meta = undefined;

  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['isLoaded']) {
      if (this.isLoaded) {
        this.title_style="title";
        this.date_style="date"
        this.meta_style="meta"
        this.content_style="content"
        this.thumbnail_style="thumbnail_img"
        this.thumbnail_container_style="thumbnail_c"
      }
    }
  }

  onEditClick() {
    this.pm.setTitle(this.title)
    if (this.meta == '')
      this.pm.setMeta("undefined")
    else if (this.meta != undefined)
      this.pm.setMeta(this.meta)
    this.pm.setDescription(this.description)
    this.pm.setContent(this.content)
    this.pm.setFile(this.file)
    this.pm.setThumbnail(this.descImage)
    this.pm.setEdit(true);
    this.router.navigate(['/editor'])
  }

  onDeleteClick() {
    if (confirm('Are you sure you want to delete the following post?\n' + this.title + ' - ' + this.file + ' - ' + this.index)) {
      this.deleteInProgress = true;
        this.pm.deletePost(this.file).then(() => {
          location.reload();
          this.deleteInProgress = false;
      });
    }
  }

  onPostOpen() {
    this.pm.clickedId = this.etag;
    this.opened = 'true';
    this.parsedOpened = this.opened === 'true';
    this.router.navigate([this.file.slice(0, this.file.length-4)])
  }

  returnClicked() {
    this.opened = 'false';
    this.parsedOpened = this.opened === 'true';
    this.pm.clickedId = '-1';
    this.loc.back()
  }
}
