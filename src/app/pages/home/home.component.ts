import { Component } from '@angular/core';
import { PostManagerService } from 'src/app/services/posts/post-manager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private postService: PostManagerService) {}

  posts = {}
  postsLoaded = false;

  async ngOnInit() {

  }

}
