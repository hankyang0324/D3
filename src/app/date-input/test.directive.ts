import {Directive, ElementRef, Renderer, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[testDirective]'
})
export class TestDirective {
  model:string = 'mm/dd/yyyy';
  preVal:string = this.el.nativeElement.value;
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

  constructor(private el: ElementRef,private render: Renderer) {}

  @HostListener('click', ['$event']) onClick(event) {
    this.preVal = this.el.nativeElement.value; //拿初值
    if(this.preVal===''){ //第一次操作，把光标移动到开头
      this.preVal='mm/dd/yyyy';
      this.ngModelChange.emit(this.preVal); //传值
      this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal); //渲染，使光标位置不会移到末尾
      this.el.nativeElement.setSelectionRange(0,0,'none'); //把光标移到开头
    }
  }

  @HostListener('blur', ['$event']) onBlur(event) {
    if(this.preVal==='mm/dd/yyyy'){ //如果没有操作，删除值，显示placeholder
      this.preVal='';
      this.ngModelChange.emit(this.preVal); 
    }
  }

  @HostListener('keydown', ['$event']) onKeydown(event) { //keydown包括backspace，control，shift等不显示字符的key， keypress不包括
    this.preVal = this.el.nativeElement.value || 'mm/dd/yyyy'; //拿初值,空的话设为mm/dd/yyyy
    let pos = this.el.nativeElement.selectionStart;//获得keydown前光标位置
    let posEnd = this.el.nativeElement.selectionEnd;//获得光标选中部分结尾位置，用于退格删除
    // console.log(event.key);
    // console.log(pos);
    if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') return; //左移右移
    event.preventDefault(); //防止input character直接出现在输入框内,(input) event binding将无效
    if(event.key === 'Backspace') { //退格，将删除的数字替换成字母
      if(posEnd === pos && pos>0){ //删一位
        if(pos===3 || pos===6) pos--; //跳过slash
        this.preVal = this.preVal.substr(0,pos-1)+this.model[pos-1]+this.preVal.substr(pos); //当前值
        this.ngModelChange.emit(this.preVal); //传值
        this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal); //渲染，使光标位置不会移到末尾
        this.el.nativeElement.setSelectionRange(pos-1,pos-1,'none'); //移动光标
        return;
      }
      if(posEnd!==pos){ //删多位
        this.preVal = this.preVal.substr(0,pos)+this.model.substring(pos,posEnd)+this.preVal.substr(posEnd);
        this.ngModelChange.emit(this.preVal); //传值
        this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal); //渲染，使光标位置不会移到末尾
        this.el.nativeElement.setSelectionRange(pos,pos,'none'); //移动光标
      }
    } 
    if('0'<=event.key && event.key<='9' && pos<10) { //只识别number，输入位数不多于10位
      if(pos===0) { //输入month高位
        if(event.key>'1') { //如果month第一位大于1，月份直接变成0+x
          switch(event.key) { 
            case '4':case '6':case '9':{
              if(this.preVal[3]==='3') { //4，6，9月小月。如果day是3x，改成30
                this.preVal = 0+event.key+'/30'+this.preVal.substr(5);
                this.ngModelChange.emit(this.preVal);
                this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
                this.el.nativeElement.setSelectionRange(pos+2,pos+2,'none');
                return;
              }
            }
            case '2':{
              if(parseInt(this.preVal.substr(3,2))>28) {
                if(this.isLeapYear(this.preVal.substr(6))){ //润年2月day大于28改成29
                  this.preVal = 0+event.key+'/29'+this.preVal.substr(5);
                  this.ngModelChange.emit(this.preVal);
                  this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
                  this.el.nativeElement.setSelectionRange(pos+2,pos+2,'none');
                  return;
                }
                if(!this.isLeapYear(this.preVal.substr(6))){ //平年2月day大于28改成28
                  this.preVal = 0+event.key+'/28'+this.preVal.substr(5);
                  this.ngModelChange.emit(this.preVal);
                  this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
                  this.el.nativeElement.setSelectionRange(pos+2,pos+2,'none');
                  return;
                }
              }
            }
          }
          this.preVal = 0+event.key+this.preVal.substr(pos+2); //如果month第一位大于1，其余情况月份直接变成0+x
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+2,pos+2,'none');
          return;
        }
        if(event.key === '1') { //如果month第一位是1
          if(this.preVal[1]>'2' && this.preVal[1]<='9') { //如果month第一位是1，第二位大于2，改成12月
            this.preVal = 12+this.preVal.substr(pos+2);
            this.ngModelChange.emit(this.preVal);
            this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
            this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
            return;
          }
          if(this.preVal[1] === '1' && parseInt(this.preVal.substr(3,2))>30) { //如果11月，day大于30，改成30
            this.preVal = '11/30'+this.preVal.substr(5);
            this.ngModelChange.emit(this.preVal);
            this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
            this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
            return;
          }
        }
        if(event.key === '0'){ //如果month第一位是0，判断润2月
          if(this.preVal[1]==='2' && parseInt(this.preVal.substr(3,2))>28){ 
            if(this.isLeapYear(this.preVal.substr(6))){
              this.preVal = '02/29'+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
            if(!this.isLeapYear(this.preVal.substr(6))){
              this.preVal = '02/28'+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
          }
        }
      }

      if(pos===1) { //输入month低位
        if(event.key>'2') { //月第二位大于2，月份改成0+x
          switch(event.key) {
            case '4':case '6':case'9':{ //小月最多30天
              if(this.preVal[3]==='3') {
                this.preVal = 0+event.key+'/30'+this.preVal.substr(5);
                this.ngModelChange.emit(this.preVal);
                this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
                this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
                return;
              }
            }
          }
          this.preVal = 0+event.key+this.preVal.substr(2);
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
        if(event.key === '2') { 
          if(this.preVal[0] === '0') { //2月判断天数
            if(parseInt(this.preVal.substr(3,2))>28) {
              if(this.isLeapYear(this.preVal.substr(6))){
                this.preVal = 0+event.key+'/29'+this.preVal.substr(5);
                this.ngModelChange.emit(this.preVal);
                this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
                this.el.nativeElement.setSelectionRange(pos+2,pos+2,'none');
                return;
              }
              if(!this.isLeapYear(this.preVal.substr(6))){
                this.preVal = 0+event.key+'/28'+this.preVal.substr(5);
                this.ngModelChange.emit(this.preVal);
                this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
                this.el.nativeElement.setSelectionRange(pos+2,pos+2,'none');
                return;
              }
            }
          }
        }
        if(event.key === '1') { 
          if(this.preVal[0] === '1'&& this.preVal[3]==='3') { //11月最多30天
            this.preVal = '11/30'+this.preVal.substr(5);
            this.ngModelChange.emit(this.preVal);
            this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
            this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
            return;
          }
        }
        if(event.key === '0') { //月第二位是0，则直接改成10月
          this.preVal = 10+this.preVal.substr(2);
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
      }

      if(pos===2||pos===5) pos++; //跳过slash

      if(pos===3){ //输入day高位
        if(parseInt(event.key+this.preVal[4])>28) { //day大于28的情况，判断润2月
          if(this.preVal.substr(0,2)==='02'){ 
            if(this.isLeapYear(this.preVal.substr(6))) { //润2月，day29
              this.preVal = this.preVal.substr(0,3)+29+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
            if(!this.isLeapYear(this.preVal.substr(6))) { //平2月，day28
              this.preVal = this.preVal.substr(0,3)+28+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
          }
        }
        if(parseInt(event.key+this.preVal[4])>30) { //day大于30的情况
          switch(this.preVal.substr(0,2)){
            case '04':case '06':case '09':case '11':{ //小月day30
              this.preVal = this.preVal.substr(0,3)+30+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+2,pos+2,'none');
              return;
            }
          }
          this.preVal = this.preVal.substr(0,3)+31+this.preVal.substr(5); //大月day31
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
        if(event.key>2){ //day高位大于2的情况
          switch(this.preVal.substr(0,2)) {
            case '02':{ //2月高位改成2
              this.preVal = this.preVal.substr(0,pos)+2+this.preVal.substr(pos+1);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
            case '04':case '06':case '09':case '11':{ //小月，day高位改成3，day低位自动填0
              this.preVal = this.preVal.substr(0,pos)+30+this.preVal.substr(pos+2);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
          }
          this.preVal = this.preVal.substr(0,pos)+3+this.preVal.substr(pos+1);//大月，day高位改成3
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
        if(event.key === '0'&& this.preVal[4] === '0') { //day00改成day01
          this.preVal = this.preVal.substr(0,pos)+'01'+this.preVal.substr(pos+2);
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
      }

      if(pos===4){ //输入day低位
        if(parseInt(this.preVal[3]+event.key)>28) { //day大于28，判断闰2月
          if(this.preVal.substr(0,2)==='02'){ 
            if(this.isLeapYear(this.preVal.substr(6))) { //润2月，day29
              this.preVal = this.preVal.substr(0,3)+29+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
            if(!this.isLeapYear(this.preVal.substr(6))) { //平2月，day28
              this.preVal = this.preVal.substr(0,3)+28+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
          }
        }
        if(parseInt(this.preVal[3]+event.key)>30) { //day大于30，判断大小月
          switch(this.preVal.substr(0,2)){
            case '04':case '06':case '09':case '11':{ //小月day30
              this.preVal = this.preVal.substr(0,3)+30+this.preVal.substr(5);
              this.ngModelChange.emit(this.preVal);
              this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
              this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
              return;
            }
          }
          this.preVal = this.preVal.substr(0,3)+31+this.preVal.substr(5); //大月day31
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
        if(event.key === '0'&& this.preVal[3] === '0') { //day00改成day01
          this.preVal = this.preVal.substr(0,pos-1)+'01'+this.preVal.substr(pos+1);
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
      }

      if(pos>=6){ //year
        this.preVal = this.preVal.substr(0,pos) + event.key + this.preVal.substr(pos+1);
        if(this.preVal.substr(6,4) === '0000') { //0000年改0001年
          if(this.preVal.substr(0,5) === '02/29') {
            this.preVal = '02/28/0001';
            this.ngModelChange.emit(this.preVal);
            this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
            this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
            return;
          }
          this.preVal = this.preVal.substr(0,6)+'0001';
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
        if(this.preVal.substr(0,5)==='02/29' && !this.isLeapYear(this.preVal.substr(6,4))){ //平年02/29改02/28
          this.preVal = '02/28/'+this.preVal.substr(6,4);
          this.ngModelChange.emit(this.preVal);
          this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);
          this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');
          return;
        }
      }
      //其余一般情况
      this.preVal = this.preVal.substr(0,pos)+event.key+this.preVal.substr(pos+1);//当前位替换成输入数字
      this.ngModelChange.emit(this.preVal);//传值
      this.render.setElementProperty(this.el.nativeElement, 'value', this.preVal);//渲染，使光标位置不会移到末尾
      this.el.nativeElement.setSelectionRange(pos+1,pos+1,'none');//移动光标
      return;
    }
  }

  isLeapYear(str){ //判断闰年
    for(let i of str){
      if(i<'0' || i>'9') return true; //没有填完视作闰年
    }
    let year = parseInt(str);
    if(year%4 !== 0 || (year%100 === 0 && year%400 !== 0)) return false;
    return true;
  }
}
