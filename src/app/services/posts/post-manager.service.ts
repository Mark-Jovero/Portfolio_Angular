import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, lastValueFrom, map, Observable } from 'rxjs';
import { CookieReadService } from '../cookie/cookie-read.service';
import { BACKEND, BACKEND_HOST } from 'src/globals';
import { EMPTY_OBSERVER } from 'rxjs/internal/Subscriber';
import { Filename } from 'aws-sdk/clients/elastictranscoder';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class PostManagerService {

  constructor(private http: HttpClient, private cache: CacheService, private cookieRead: CookieReadService, private router: Router, private route: ActivatedRoute) {}

  private isMetaSet = false;
  private isContentSet = false;

  clickedId = '-1';
  postsPerPage = 4;
  totalPosts = Number(this.cache.read('_TOTAL_POSTS_'));
  maxPage = 0
  currentPage = 1;


  Title = ''
  Meta = ''
  Thumbnail = ''
  posts : any = {}
  selected_post : string = '';
  Content = ''

  private POST_CREDENTIAL = {
    user_id: this.cookieRead.read('user_id'),
    session_cookie: this.cookieRead.read('session_cookie'),
  }

  private POST_DATA = {
    Title: '',
    Meta: '',
    Description: '',
    Thumbnail: '',
    Content: '',
    fileName: '',
  }

  private editRequested = false;

  public setEdit(isEdit: boolean) {
    this.editRequested = isEdit;
  }

  public getEditStatus() {
    return this.editRequested;
  }

  public setTitle(title: string) {
    this.POST_DATA.Title = title
  }

  public getTitle() : string {
    return this.POST_DATA.Title;
  }

  public setMeta(meta: string) {
    this.POST_DATA.Meta = meta
  }

  public getMeta() : string {
    return this.POST_DATA.Meta;
  }

  public setDescription(desc: string) {
    this.POST_DATA.Description = desc;
  }

  public getDescription() : string {
    return this.POST_DATA.Description;
  }

  public setThumbnail(tn: string) {
    this.POST_DATA.Thumbnail = tn;
  }

  public getThumbnail() : string {
    return this.POST_DATA.Thumbnail;
  }


  public setContent(content: string) {
    this.POST_DATA.Content = content;
  }

  public getContent() : string {
    return this.POST_DATA.Content;
  }

  public setFile(fn: string) {
    this.POST_DATA.fileName = fn;
  }

  public getFile() : string {
    return this.POST_DATA.fileName;
  }

  public resetData() {
    this.POST_DATA = {
      Title: '',
      Meta: '',
      Description: '',
      Thumbnail: '',
      Content: '',
      fileName: '',
    }
  }

  public updateMaxPage() {
    this.maxPage = Math.ceil(this.totalPosts / this.postsPerPage)
  }

  public updateCurrentPage(page: number) {
    this.currentPage = page > 0 ? page : 1;
  }

  public incPage() {
    if (this.currentPage < this.maxPage) {
      this.currentPage++;
      this.cache.write('_CURR_PAGE_', String(this.currentPage), false);
      this.router.navigate(['page/' + this.currentPage])
    }
  }

  public decPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cache.write('_CURR_PAGE_', String(this.currentPage), false);
      this.router.navigate(['page/' + this.currentPage])
    }
  }  

  private request_add_post(): Observable<string> {
    if (!this.isMetaSet || !this.isContentSet)
      return EMPTY;

    return this.http.post(BACKEND.protected_routes.set.posts, this.POST_CREDENTIAL, {responseType: 'text', withCredentials: true,}).pipe(
      map(response => response)
    )};
  
  public async addPost(id: number): Promise<{}> {
    let req = this.request_add_post();
    let res = (await lastValueFrom(req));
    return res;
  }


  private request_posts_by_loggedin_user(): Observable<string> {
    return this.http.post(BACKEND.protected_routes.get.posts, this.POST_CREDENTIAL, {responseType: 'text', withCredentials: true,}).pipe(
      map(response => response)
    )};
  
  public async getPostsByCurrentUser(): Promise<{}> {
    let req = this.request_posts_by_loggedin_user();
    let res = (await lastValueFrom(req));
    return res;
  }

  private request_post(fileName: string): Observable<string> {
    return this.http.post(BACKEND.unprotected_routes.get.post, {fileName: fileName} ,{responseType: 'text', withCredentials: true,}).pipe(
      map(response => response)
  )};

  private request_poskeys(): Observable<string> {
    return this.http.get(BACKEND.unprotected_routes.get.keys ,{responseType: 'text', withCredentials: true,}).pipe(
      map(response => response)
  )};

  public async getAllPostKeys(): Promise<[]> {
    let req = this.request_poskeys();
    let res = (lastValueFrom(req));
    let parsed = JSON.parse(await res)
    this.cache.write('_TOTAL_POSTS_', parsed.length, false);
    this.totalPosts = Number(this.cache.read('_TOTAL_POSTS_'));
    return parsed;
  }
  
  public async getPost(fileName: string): Promise<[]> {
    let req = this.request_post(fileName);
    let res = (lastValueFrom(req));
    let parsed = JSON.parse(await res)
    parsed['fileName'] = fileName
    return parsed;
  }

  private delete_post(fileName: string): Observable<string> {
    return this.http.post(BACKEND.protected_routes.del.posts, 
      {user_id: this.cookieRead.read('user_id'), session_cookie: this.cookieRead.read('session_cookie'), fileName: fileName}, 
      {responseType: 'text', withCredentials: true,}).pipe(
      map(response => response));
  };
  
  public async deletePost(fileName: string): Promise<{}> {
    let req = this.delete_post(fileName);
    let res = (await lastValueFrom(req));
    return res;
  }

  private get_cache_key() {
    return this.http.get(BACKEND.unprotected_routes.get.cachekey,
      {responseType: 'text', withCredentials: true,}).pipe(
      map(response => response));
  }

  public async getCacheKey(): Promise<string> {
    let req = this.get_cache_key()
    let res = (await lastValueFrom(req));
    return res;
  }

  private add_image(fileName: string | undefined, imageFile: string) {
    console.log("file1: ",imageFile)
    return this.http.post(BACKEND_HOST + '/test12',
      {fileName: fileName, file: imageFile},
      {responseType: 'text', withCredentials: true }).pipe(
      map(response => response));
  }

  public async addImage(fileName: string | undefined, imageFile: string): Promise<string> {
    console.log('file2: ', imageFile)
    let req = this.add_image(fileName, imageFile);
    let res = (await lastValueFrom(req));
    return res;
  }

  private get_image(fileName: string) {
    return this.http.get(BACKEND.unprotected_routes.get.post,
      {responseType: 'text', withCredentials: true,}).pipe(
      map(response => response));
  }

  public async getImage(fileName: string): Promise<string> {
    let req = this.get_image(fileName)
    let res = (await lastValueFrom(req));
    return res;
  }
}
