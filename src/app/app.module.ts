import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FullMenuComponent } from './components/full-menu/full-menu.component';
import { FullFooterComponent } from './components/full-footer/full-footer.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CreateAccountComponent } from './components/auth/create/create-account/create-account.component';
import { PostEditorComponent } from './components/posts/post-editor/post-editor.component';
import {SafeHtmlPipe} from "./safestyle";
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { PostComponentComponent } from './components/posts/post-component/post-component.component';
import { PostPlaceholderComponent } from './components/posts/post-placeholder/post-placeholder.component';
import { LoadingScreenComponent } from './components/misc/loading-screen/loading-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    FullMenuComponent,
    FullFooterComponent,
    LoginComponent,
    DashboardComponent,
    CreateAccountComponent,
    PostEditorComponent,
    SafeHtmlPipe,
    PortfolioComponent,
    PostComponentComponent,
    PostPlaceholderComponent,
    LoadingScreenComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
