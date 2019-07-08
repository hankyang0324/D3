import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  selected:string = '';
  width: number = 900;

  ngOnInit(){
    // this.width = document.querySelector('body').offsetWidth;
  }

  show(value:string){
    this.selected = value;
  }

  onResize(event) {
    // this.width = event.target.innerWidth;
  }
}
