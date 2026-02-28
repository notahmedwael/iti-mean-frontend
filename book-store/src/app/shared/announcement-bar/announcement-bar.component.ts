import { Component } from '@angular/core';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  template: `
    <div class="w-full bg-[#602314] text-white text-center py-2 text-sm tracking-wide font-medium">
      📚 Free shipping on orders over <strong>$35</strong> — Use code
      <span class="text-[#DD9047]">BOOKWORM</span>
    </div>
  `,
})
export class AnnouncementBarComponent {}
