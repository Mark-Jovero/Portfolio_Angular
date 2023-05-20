import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CreateAccountComponent } from './components/auth/create/create-account/create-account.component';
import { LoginComponent } from './components/auth/login/login.component';
import { PostEditorComponent } from './components/posts/post-editor/post-editor.component';
import { HomeComponent } from './pages/home/home.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { AuthGuard } from './services/auth/auth.guard';
import { LoginGuard } from './services/auth/login.guard';


const routes: Routes = [
  { path: '', redirectTo: '/page/1', pathMatch: 'full' },
  {path: "auth/login", component: LoginComponent, canActivate: [LoginGuard]},
  {path: "auth/create-account", component: CreateAccountComponent},
  {path: "admin/dashboard", component: DashboardComponent, canActivate: [AuthGuard]},
  {path: "home", component: PortfolioComponent},
  {path: "posts/:postid", component: PortfolioComponent},
  {path: "editor", component: PostEditorComponent, canActivate: [AuthGuard]},
  {path: "page/:page", component: PortfolioComponent},
  {path: "page/1", component: PortfolioComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
