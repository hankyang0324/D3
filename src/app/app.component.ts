import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  selectedSpot = 'Chile';
  width: number = 800;

  ngOnInit(){
    // this.width = document.querySelector('body').offsetWidth;
  }

  onSelectedSpot(value: string){
    this.selectedSpot = value;
  }

  onResize(event) {
    // this.width = event.target.innerWidth;
  }
}
