import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css']
})

export class LoadingScreenComponent {
onFocus() {

}
  @Input() message!: string;
  

  ngOnInit() {
    document.getElementById('test')?.focus();
  }
}
