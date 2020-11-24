import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';

import {DataSource} from '../../lib/data-source/data-source';

@Component({
  selector: 'ng2-smart-table-pager',
  styleUrls: ['./pager.component.scss'],
  template: `
    <div class="d-flex mb-4">
      <div class="flex-grow-1">
        <div *ngIf="perPageSelect && perPageSelect.length > 0">
          <span class="caption mr-2">Anzeigen</span>
          <nb-select [placeholder]="currentPerPage"
                     (change)="onChangePerPage($event)"
                     [(ngModel)]="currentPerPage">
            <nb-option *ngFor="let item of perPageSelect" [value]="item">{{ item }}</nb-option>
          </nb-select>
          <span class="caption ml-2">von {{getCount()}}</span>
        </div>
      </div>
      <div class="d-flex justify-content-center mt-2">
        <button nbButton ghost class="mr-1"
                [disabled]="+getPage() === 1" (click)="+getPage() === 1 ? false : prev()" aria-label="Prev">
          <nb-icon icon="chevron-left-outline"></nb-icon>
          Zurück
        </button>
        <button nbButton
                shape="round"
                size="small"
                *ngFor="let page of getPages()"
                [status]="+getPage() === page ? 'primary' : 'basic'"
                (click)="+getPage() === page ? false : paginate(page)"
                class="mr-1 px-3">
          {{ page }} </button>
        <button nbButton [status]="+getPage() === +getLast() ? 'basic' : 'primary'" ghost
                [disabled]="+getPage() === +getLast()" (click)="+getPage() === +getLast() ? false : next()" aria-label="Next">
          Weiter
          <nb-icon icon="chevron-right-outline"></nb-icon>
        </button>
      </div>
    </div>
  `,
})
export class PagerComponent implements OnChanges {

  @Input() source: DataSource;
  @Input() perPageSelect: any[] = [];

  @Output() changePage = new EventEmitter<any>();

  currentPerPage: any;

  protected pages: Array<any>;
  protected page: number;
  protected count: number = 0;
  protected perPage: number;

  protected dataChangedSub: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.source) {
      if (!changes.source.firstChange) {
        this.dataChangedSub.unsubscribe();
      }
      this.dataChangedSub = this.source.onChanged().subscribe((dataChanges) => {
        this.page = this.source.getPaging().page;
        this.perPage = this.source.getPaging().perPage;
        this.currentPerPage = this.perPage;
        this.count = this.source.count();
        if (this.isPageOutOfBounce()) {
          this.source.setPage(--this.page);
        }

        this.processPageChange(dataChanges);
        this.initPages();
      });
    }
  }

  /**
   * We change the page here depending on the action performed against data source
   * if a new element was added to the end of the table - then change the page to the last
   * if a new element was added to the beginning of the table - then to the first page
   * @param changes
   */
  processPageChange(changes: any) {
    if (changes['action'] === 'prepend') {
      this.source.setPage(1);
    }
    if (changes['action'] === 'append') {
      this.source.setPage(this.getLast());
    }
  }

  getCount(): number {
    return this.count;
  }

  shouldShow(): boolean {
    return this.source.count() > this.perPage;
  }

  paginate(page: number): boolean {
    this.source.setPage(page);
    this.page = page;
    this.changePage.emit({page});
    return false;
  }

  next(): boolean {
    return this.paginate(this.getPage() + 1);
  }

  prev(): boolean {
    return this.paginate(this.getPage() - 1);
  }

  getPage(): number {
    return this.page;
  }

  getPages(): Array<any> {
    return this.pages;
  }

  getLast(): number {
    return Math.ceil(this.count / this.perPage);
  }

  isPageOutOfBounce(): boolean {
    return (this.page * this.perPage) >= (this.count + this.perPage) && this.page > 1;
  }

  initPages() {
    const pagesCount = this.getLast();
    let showPagesCount = 4;
    showPagesCount = pagesCount < showPagesCount ? pagesCount : showPagesCount;
    this.pages = [];

    if (this.shouldShow()) {

      let middleOne = Math.ceil(showPagesCount / 2);
      middleOne = this.page >= middleOne ? this.page : middleOne;

      let lastOne = middleOne + Math.floor(showPagesCount / 2);
      lastOne = lastOne >= pagesCount ? pagesCount : lastOne;

      const firstOne = lastOne - showPagesCount + 1;

      for (let i = firstOne; i <= lastOne; i++) {
        this.pages.push(i);
      }
    }
  }

  onChangePerPage(event: any) {
    if (this.currentPerPage) {

      if (typeof this.currentPerPage === 'string' && this.currentPerPage.toLowerCase() === 'all') {
        this.source.getPaging().perPage = null;
      } else {
        this.source.getPaging().perPage = this.currentPerPage * 1;
        this.source.refresh();
      }
      this.initPages();
    }
  }

}
