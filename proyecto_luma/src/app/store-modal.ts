import { afterNextRender, Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: 'dialog[storeModal]',
  exportAs: 'storeModal',
  host: { '(cancel)': 'cancel($event)', '(click)': 'onBackdrop($event)' },
})
export class StoreModal {
  private readonly dialog = inject(ElementRef<HTMLDialogElement>).nativeElement;
  readonly dismiss = output<void>();

  constructor() {
    afterNextRender(() => {
      if (this.dialog.isConnected && !this.dialog.open) this.dialog.showModal();
    });
  }

  cancel(event: Event) {
    event.preventDefault();
    this.close();
  }

  onBackdrop(event: MouseEvent) {
    if (event.target !== this.dialog) return;
    const { left, top, right, bottom } = this.dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) this.close();
  }

  close() {
    this.dialog.close();
    this.dismiss.emit();
  }
}
