import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Params, Route, Router } from '@angular/router';
import { range } from 'rxjs';
import { LoginService } from 'src/app/services/auth/login.service';
import { CacheService } from 'src/app/services/cache/cache.service';
import { PostManagerService } from 'src/app/services/posts/post-manager.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})


export class PortfolioComponent {

  constructor(public pm: PostManagerService, private ls: LoginService, private route: ActivatedRoute, public cache: CacheService, public router: Router) {}

  errorMessage : string | undefined;
  postObjectNames : any = []
  posts : any | {} = {}
  pages = 0
  placeholder = []
  keys : any = []
  postsLoaded = false;
  postsDataLoaded = false;
  isLoggedIn = false;
  routeClickedPostID: string | null = null;
  enc = new TextDecoder("utf-8");
  currPage: number = 1
  selected : any = {}
  selected_post_had_loaded = false;


  postLinkStyle: string = 'postLink'
  cacheKey = ""

  toNumber(str: string): number {
    return Number(str);
  }

  objectKeys(obj: {}) {
    return Object.keys(obj);
  }

  async ngOnInit() {
    this.pm.updateMaxPage();
    const clickedPostID2 = this.route.snapshot.paramMap.get('page');
    if (clickedPostID2) {
      this.pm.currentPage = Number(clickedPostID2)
    }

    if (this.pm.currentPage > this.pm.maxPage || !this.pm.currentPage) {
      this.router.navigate(['/page/1']);
    }
    
    const clickedPostID = this.route.snapshot.paramMap.get('postid');
    if (clickedPostID) {
      this.pm.clickedId = clickedPostID
      window.scrollTo(0,0);
      this.pm.selected_post = clickedPostID
      this.selected = {
        Index: 0,
        Title: ' ',
        TextArea: '<br>'.repeat(20),
        Description: ' ',
        DescThumbnail: ' ',
        Meta: ' ',
        Name: ' ',
        dateModified: ' ',
        ETag: ' ',
        isLoaded: false,
      }
      let objectFile = JSON.parse(JSON.stringify(await this.pm.getPost("posts/" + this.pm.selected_post + ".txt")))
      if (objectFile.hasError) {
        if (objectFile.errorMessage == "NoSuchKey")
          this.errorMessage = 'File could not be located.';
        else
          this.errorMessage = 'An unknown error has occured.';
        this.selected = {
          isLoaded: true,
        }
        return;
      }
      let decodedObjectBody = JSON.parse(this.enc.decode(new Uint8Array(objectFile.message.Body.data)))
      console.log(decodedObjectBody)
      this.selected = {
          Index: 0,
          Title: decodedObjectBody.content.Title,
          TextArea: decodedObjectBody.content.TextArea,
          Description: decodedObjectBody.content.Description,
          DescThumbnail: decodedObjectBody.content.DescThumbnail,
          Meta: decodedObjectBody.content.Meta,
          Name: objectFile.fileName,
          dateModified: new Date(objectFile.message.LastModified).toLocaleString(),
          ETag: objectFile.message.ETag,
          isLoaded: true,
      }

      this.selected_post_had_loaded = true;
    } else {
      this.pm.clickedId = '-1';
    }


    this.isLoggedIn = this.ls.isLoggedIn.value
    
    this.loadPosts();
    this.pm.updateMaxPage();

    this.route.params.subscribe((params: Params) => this.pm.currentPage = params['page']);
  }

  /**
   * CHECKS BROWSER CACHE KEY AGAINST SERVER CACHE KEY,
   * LOADS NEW DATA IF DIFFERENT, OTHERWISE KEEP CURRENT DATA
   * @returns 
   */
  async loadPosts() {
    this.postsLoaded = false;

    let storedPosts = this.cache.read('_POSTS_')
    this.cacheKey = JSON.parse(await this.pm.getCacheKey()).message.value;

    if (!this.cacheKey) {
      this.errorMessage = 'Unable to retrieve cache key.';
      console.warn('Unable to retrieve cache key.')
      return;
    }

    /**
     * RETRIEVE POST DATA FROM CACHE AND PARSE
     */
    if (storedPosts) {
      this.pm.posts = JSON.parse(storedPosts);
      this.postsDataLoaded = true;
    }

    /**
     * CURRENT PAGE IS IN CACHE BUT CACHE KEY DOES NOT MATCH SERVER KEY
     */
    if (this.pm.posts[this.pm.currentPage] && this.pm.posts[this.pm.currentPage][0] != this.cacheKey) {
      console.log(this.pm.posts[this.pm.currentPage][0])
      this.postsDataLoaded = false;
      this.pm.posts[this.pm.currentPage] = undefined;
      console.warn('Cache key does not match server cache key, clearing current page cache')
    }

    /**
     * CURRENT PAGE IS NOT STORED IN CACHE (ie First Time Load)
     * STORE STRUCTURE:
     *  - First item is this cache key. This will be checked against the server to check if reload is needed.
     *  - All other items are the objects itself.
     */
    if (!this.pm.posts[this.pm.currentPage]) {
      this.postObjectNames = await this.pm.getAllPostKeys();
      this.postObjectNames = this.postObjectNames.slice(((this.pm.currentPage-1) * this.pm.postsPerPage),((this.pm.currentPage) * this.pm.postsPerPage) - 0)
      

      if (!this.postObjectNames) {
        this.errorMessage = 'Unable to retrieve objects from AWS S3.';
        console.warn('Unable to retrieve objects from AWS S3.');
        return;
      }

      // [cacheKey, {item1}, {item2}, ...]
      this.pm.posts[this.pm.currentPage] = [this.cacheKey]
      console.log(this.postObjectNames.slice((this.pm.currentPage-1) * this.pm.postsPerPage,((this.pm.currentPage) * this.pm.postsPerPage) - 0))
      // Load placeholders
      for (let key in this.postObjectNames) {
        console.log('push', key)
        this.pm.posts[this.pm.currentPage].push({
          Index: key,
          Title: ' ',
          TextArea: ' ',
          Description: ' ',
          DescThumbnail: ' ',
          Meta: ' ',
          Name: ' ',
          dateModified: ' ',
          ETag: ' ',
          isLoaded: false,
        });
      
      }
      this.postsLoaded = true;

      for (let key in this.postObjectNames) {
        console.log(this.postObjectNames[key])
        let objectFile = JSON.parse(JSON.stringify(await this.pm.getPost(JSON.parse(JSON.stringify(this.postObjectNames[ Number(key)])).Key)));
        this.postsLoaded = true;
        let decodedObjectBody = JSON.parse(this.enc.decode(new Uint8Array(objectFile.message.Body.data)))
        console.log(objectFile)
        this.pm.posts[this.pm.currentPage][Number(key)+1] = {
          Index: key,
          Title: decodedObjectBody.content.Title,
          TextArea: decodedObjectBody.content.TextArea,
          Description: decodedObjectBody.content.Description,
          DescThumbnail: decodedObjectBody.content.DescThumbnail,
          Meta: decodedObjectBody.content.Meta,
          Name: objectFile.fileName,
          dateModified: new Date(objectFile.message.LastModified).toLocaleString(),
          ETag: objectFile.message.ETag,
          isLoaded: true,
        }
        // this.pm.posts[this.pm.currentPage].push({
        //   Index: key,
        //   Title: decodedObjectBody.content.Title,
        //   TextArea: decodedObjectBody.content.TextArea,
        //   Description: decodedObjectBody.content.Description,
        //   DescThumbnail: decodedObjectBody.content.DescThumbnail,
        //   Meta: decodedObjectBody.content.Meta,
        //   Name: objectFile.fileName,
        //   dateModified: new Date(objectFile.message.LastModified).toLocaleString(),
        //   ETag: objectFile.message.ETag,
        // });
      }
      this.cache.write('_POSTS_', this.pm.posts, true);
      this.postsDataLoaded = true;
    }

    console.log(this.pm.posts)
    this.postsLoaded = true;
    this.pm.updateMaxPage()

    // let cachekey = JSON.parse(await this.pm.getCacheKey()).message.value;
    // if(!this.cache.read('_CACHE_KEY_') || cachekey != this.cache.read('_CACHE_KEY_') || Number(this.cache.read('_CURR_PAGE_')) < this.pm.currentPage) {
    //   //this.cache.write('_CACHE_KEY_', cachekey, false);
    //   this.cache.write('_CURR_PAGE_', this.pm.currentPage.toString(), false);
    //   this.cache.delete('POSTS')
    //   console.log('deleted')
    //   let keys = await this.pm.getAllPostKeys();

    //   this.postsLoaded = true;
    //   this.pm.posts = {}

    //   //this.posts = this.pm.posts[''].slice((this.pm.currentPage-1) * this.pm.postsPerPage, this.pm.currentPage * this.pm.postsPerPage)
    //   for (let key in keys) {
    //     let object = JSON.parse(JSON.stringify(keys[key]));

    //     let l = JSON.parse(JSON.stringify(await this.pm.getPost(object.Key)));
    //     this.posts[this.pm.currentPage] = JSON.parse(JSON.stringify(l)).message;
      
  
    //     let decodedContent = JSON.parse(this.enc.decode(new Uint8Array(l.message.Body.data)))
    //     let json = {Index: '', Title: '', dateModified: '', TextArea: '', Meta: '', ETag: '', Name: '', Description: '', DescThumbnail: ''};
    //     json['Index'] = key
    //     json['Title'] = decodedContent.content.Title;
    //     json['ETag'] = l.message.ETag;
    //     json['dateModified'] = new Date(object.LastModified).toLocaleString();
    //     json['TextArea'] = String(decodedContent.content.TextArea);
    //     json['Description'] = decodedContent.content.Description;
    //     json['Meta'] = decodedContent.content.Meta;
    //     json['Name'] = l.fileName;
    //     json['DescThumbnail'] = decodedContent.content.DescThumbnail;
        
    //     if (!this.pm.posts[this.pm.currentPage]) {
    //       this.pm.posts[this.pm.currentPage] = [json]
    //     } else {
    //       this.pm.posts[this.pm.currentPage].push(json)
    //     }

    //     this.placeholder.pop();

    //   }
    //   console.log(this.pm.posts)
    //   console.log(JSON.stringify(this.pm.posts))
    //   this.cache.write('POSTS', this.pm.posts, true);
    //   this.pm.updateMaxPage()

    // } else {
    //   let currentCacheKey = this.cache.read('_CACHE_KEY_');
    //   this.postsLoaded = true;

    //   // Posts has not been updated.
    //   if(currentCacheKey == cachekey) {

    //     this.pm.posts = JSON.parse(this.cache.read('POSTS') || '{}')
    //     this.pm.updateMaxPage()
    //     this.posts[this.pm.currentPage] = this.pm.posts.slice((this.pm.currentPage-1) * this.pm.postsPerPage, this.pm.currentPage * this.pm.postsPerPage)
    //     console.log(this.posts)
    //     for (let key in this.posts) {
    //       let object = JSON.parse(JSON.stringify(this.pm.posts[key]));
    //       let json = {Index: '', Title: '', dateModified: '', TextArea: '', Meta: '', ETag: '', Name: '', Description: ''};
    //       json['Index'] = key
    //       json['Title'] = object.Title;
    //       json['ETag'] = object.ETag;
    //       json['dateModified'] = new Date(object.LastModified).toLocaleString();
    //       json['TextArea'] = String(object.TextArea);
    //       json['Description'] = object.Description;
    //       json['Meta'] = object.Meta==''?"undefined":object.Meta;
    //       json['Name'] = object.Name;
    //     }

    //   } else { // Posts has been updated, retrieve/update posts in cache

    //   }
    // }
  }

  /**
   * HANDLES PREVIOUS PAGE BUTTON CLICK EVENT
   */
  onPrevPageClick() {
    this.pm.decPage();
    this.loadPosts();
  }

  /**
   * HANDLES NEXT PAGE BUTTON CLICK EVENT
   */
  onNextPageClick() {
    this.pm.incPage();
    this.loadPosts();
  }

  /**
   * HANDLES NEW POST BUTTON CLICK
   */
  onAddClick() {
    this.router.navigate(['/editor'])
  }
}
