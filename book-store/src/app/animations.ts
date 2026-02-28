import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';

export const slideDown = trigger('slideDown', [
  state('open', style({ maxHeight: '24rem', opacity: 1 })),
  state('closed', style({ maxHeight: '0', opacity: 0 })),
  transition('closed <=> open', animate('300ms ease-in-out')),
]);

export const fadeInModal = trigger('fadeInModal', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95) translateY(8px)' }),
    animate(
      '200ms ease-out',
      style({ opacity: 1, transform: 'scale(1) translateY(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '150ms ease-in',
      style({ opacity: 0, transform: 'scale(0.95) translateY(4px)' })
    ),
  ]),
]);

export const fadeInBackdrop = trigger('fadeInBackdrop', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 })),
  ]),
]);

export const mobileMenuSlide = trigger('mobileMenuSlide', [
  state('open', style({ maxHeight: '20rem', opacity: 1 })),
  state('closed', style({ maxHeight: '0', opacity: 0 })),
  transition('closed <=> open', animate('300ms ease-in-out')),
]);

export const mobileSidebarSlide = trigger('mobileSidebarSlide', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(-100%)' })),
  ]),
]);

export const bookHover = trigger('bookHover', [
  state('default', style({ transform: 'translateY(0) rotate(0deg)' })),
  state('hovered', style({ transform: 'translateY(-8px) rotate(1deg)' })),
  transition('default <=> hovered', animate('500ms ease')),
]);

export const cartAdded = trigger('cartAdded', [
  state('idle', style({ backgroundColor: '#BC552A' })),
  state('added', style({ backgroundColor: '#16a34a' })),
  transition('idle <=> added', animate('300ms ease')),
]);
