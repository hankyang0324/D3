import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.css']
})
export class DateInputComponent implements OnInit {
  invalid:boolean = false;
  @Input() date: string;
  @Input('disabled') disabled: boolean = false;
  @Input('width') width: string;
  @Output() getDate = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
    this.width+='px';
  }

  detectChange(value) {
    this.invalid = false;
    let arr = value.split('/');
    for(let str of arr){
      for(let item of str){
        if(item<'0'||item>'9') return;
      }
    }
    this.date = value;
  }

  onClick(){
    this.invalid = false;
  }

  onBlur(event:Event){
    const data = (<HTMLInputElement>event.target).value;
    let arr = data.split('/');
    for(let str of arr){
      for(let item of str){
        if(item<'0'||item>'9') {
          this.getDate.emit(this.date);
          return this.invalid = true;
        }
      }
    }
    this.date = data;
    this.getDate.emit(this.date);
    this.invalid = false;
  }
}
