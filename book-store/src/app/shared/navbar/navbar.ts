import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink], // This makes the clickable links in your HTML work
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {}
