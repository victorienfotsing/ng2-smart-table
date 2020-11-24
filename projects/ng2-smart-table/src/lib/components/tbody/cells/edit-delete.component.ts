import {Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy, OnInit} from '@angular/core';

import { Grid } from '../../../lib/grid';
import { Row } from '../../../lib/data-set/row';
import { DataSource } from '../../../lib/data-source/data-source';
import {NbMenuService} from '@nebular/theme';
import {filter, map} from 'rxjs/operators';
import {Deferred} from '../../../lib/helpers';

@Component({
  selector: 'ng2-st-tbody-edit-delete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="customAction else default">
      <button
        class="ng2-smart-action"
        nbButton
        ghost
        size="small"
        (click)="customEvent($event)">
        <nb-icon icon="more-horizontal-outline"></nb-icon>
      </button>
    </div>
    <ng-template #default>
      <a href="#" *ngIf="isActionEdit" class="ng2-smart-action ng2-smart-action-edit-edit"
          [innerHTML]="editRowButtonContent" (click)="onEdit($event)"></a>
      <a href="#" *ngIf="isActionDelete" class="ng2-smart-action ng2-smart-action-delete-delete"
          [innerHTML]="deleteRowButtonContent" (click)="onDelete($event)"></a>
    </ng-template>
  `,
})
export class TbodyEditDeleteComponent implements OnChanges {

  @Input() grid: Grid;
  @Input() row: Row;
  @Input() source: DataSource;
  @Input() deleteConfirm: EventEmitter<any>;
  @Input() editConfirm: EventEmitter<any>;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() actionTriggered = new EventEmitter<any>();
  @Output() editRowSelect = new EventEmitter<any>();

  isActionEdit: boolean;
  isActionDelete: boolean;
  editRowButtonContent: string;
  deleteRowButtonContent: string;
  customAction = false;

  constructor(private nbMenuService: NbMenuService) {
  }

  onEdit(event: any) {
    event.preventDefault();
    event.stopPropagation();

    this.editRowSelect.emit(this.row);

    if (this.grid.getSetting('mode') === 'external') {
      this.edit.emit({
        data: this.row.getData(),
        source: this.source,
      });
    } else {
      this.grid.edit(this.row);
    }
  }

  onDelete(event: any) {
    event.preventDefault();
    event.stopPropagation();

    if (this.grid.getSetting('mode') === 'external') {
      this.delete.emit({
        data: this.row.getData(),
        source: this.source,
      });
    } else {
      this.grid.delete(this.row, this.deleteConfirm);
    }
  }

  customEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const deferred = new Deferred();
    deferred.promise.then(() => {
      this.source.remove(this.row.getData());
    }).catch((err) => {
      // doing nothing
    });
    this.actionTriggered.emit({
      data: this.row.getData(),
      source: this.source,
      confirm: deferred,
    });
  }

  ngOnChanges(){
    this.isActionEdit = this.grid.getSetting('actions.edit');
    this.isActionDelete = this.grid.getSetting('actions.delete');
    this.editRowButtonContent = this.grid.getSetting('edit.editButtonContent');
    this.deleteRowButtonContent = this.grid.getSetting('delete.deleteButtonContent');
    this.customAction = this.grid.getSetting('customAction');
  }
}
