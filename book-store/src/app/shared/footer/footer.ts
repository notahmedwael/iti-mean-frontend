import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [], // The footer doesn't have internal page links right now, so this is empty
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {}
