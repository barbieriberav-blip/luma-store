import { Component, computed, input, linkedSignal } from '@angular/core';

export interface ProductPhoto {
  url: string;
  alt: string;
}

@Component({
  selector: 'app-product-gallery',
  template: `
    <figure class="gallery">
      <img class="gallery-main" [src]="photo().url" [alt]="photo().alt" (error)="useFallback($event)">
      @if (photos().length > 1) {
        <figcaption aria-live="polite">Foto {{ selected() + 1 }} de {{ photos().length }} · {{ photo().alt }}</figcaption>
        <div class="gallery-thumbs" role="group" aria-label="Fotos del producto" (keydown)="move($event)">
          @for (item of photos(); track item.url; let i = $index) {
            <button type="button" [attr.aria-label]="'Foto ' + (i + 1) + ': ' + item.alt"
              [attr.aria-pressed]="selected() === i" (click)="selected.set(i)">
              <img [src]="item.url" alt="" (error)="useFallback($event)">
            </button>
          }
        </div>
      }
    </figure>
  `,
  styles: `
    :host { display: block; min-width: 0; background: #262029; }
    .gallery { margin: 0; }
    .gallery-main { display: block; width: 100%; aspect-ratio: 4 / 4.2; object-fit: contain; background: #eee8e0; }
    figcaption { padding: .6rem .85rem 0; color: #e9dce5; font-size: .82rem; }
    .gallery-thumbs { display: flex; flex-wrap: wrap; gap: .45rem; padding: .75rem .85rem 1rem; }
    .gallery-thumbs button { padding: 2px; cursor: pointer; background: transparent; border: 2px solid #746473; border-radius: .45rem; }
    .gallery-thumbs button[aria-pressed="true"] { border-color: #f9c9e0; }
    .gallery-thumbs button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    .gallery-thumbs img { display: block; width: 2.75rem; height: 2.75rem; border-radius: .21rem; object-fit: cover; }
    @media (max-width: 650px) { .gallery-main { aspect-ratio: 5 / 3; } }
  `,
})
export class ProductGallery {
  readonly cover = input.required<ProductPhoto>();
  readonly additional = input<ProductPhoto[]>([]);
  readonly photos = computed(() => [this.cover(), ...this.additional()]);
  readonly selected = linkedSignal(() => { this.photos(); return 0; });
  readonly photo = computed(() => this.photos()[this.selected()]);

  move(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const group = event.currentTarget as HTMLElement;
    const buttons = [...group.querySelectorAll('button')];
    const focused = buttons.indexOf(event.target as HTMLButtonElement);
    if (focused < 0) return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next = (focused + offset + buttons.length) % buttons.length;
    this.selected.set(next);
    buttons[next].focus();
  }

  useFallback(event: Event) {
    const image = event.target as HTMLImageElement;
    if (image.getAttribute('src') === '/assets/product-fallback.svg') return;
    image.src = '/assets/product-fallback.svg';
  }
}
