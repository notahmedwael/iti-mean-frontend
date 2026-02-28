import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slideDown } from '../../animations';

@Component({
  selector: 'app-filter-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b border-[#602314]/10">
      <button
        (click)="toggle()"
        class="w-full flex justify-between items-center py-4 px-0 text-left font-semibold text-[#602314] hover:text-[#BC552A] transition"
      >
        {{ title }}
        <svg
          [class]="
            'w-5 h-5 transition-transform duration-300 ' +
            (open ? 'rotate-180' : 'rotate-0')
          "
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div [@slideDown]="open ? 'open' : 'closed'" class="overflow-hidden">
        <div class="pb-4">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  animations: [slideDown],
})
export class FilterAccordionComponent {
  @Input() title = '';
  @Input() defaultOpen = true;

  open = true;

  ngOnInit(): void {
    this.open = this.defaultOpen;
  }

  toggle(): void {
    this.open = !this.open;
  }
}
