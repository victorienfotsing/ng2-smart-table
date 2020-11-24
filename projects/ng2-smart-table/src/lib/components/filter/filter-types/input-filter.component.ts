import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';

import { DefaultFilter } from './default-filter';

@Component({
  selector: 'input-filter',
  template: `
    <nb-form-field>
      <input
        nbInput
        [ngClass]="inputClass"
        [formControl]="inputControl"
        class="form-control"
        type="text"
        placeholder="{{ column.title }}"/>
      <nb-icon nbSuffix icon="search-outline" pack="eva"></nb-icon>
    </nb-form-field>
  `,
})
export class InputFilterComponent extends DefaultFilter implements OnInit, OnChanges {

  inputControl = new FormControl();

  constructor() {
    super();
  }

  ngOnInit() {
    if (this.query) {
      this.inputControl.setValue(this.query);
    }
    this.inputControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(this.delay),
      )
      .subscribe((value: string) => {
        this.query = this.inputControl.value;
        this.setFilter();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.query) {
      this.inputControl.setValue(this.query);
    }
  }
}
