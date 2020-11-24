import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PagerComponent } from './pager.component';
import {NbButtonModule, NbIconModule, NbSelectModule} from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbIconModule,
    NbSelectModule,
  ],
  declarations: [
    PagerComponent,
  ],
  exports: [
    PagerComponent,
  ],
})
export class PagerModule { }
