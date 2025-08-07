/**
 * Navigation interfaces for TransitAI application
 * Provides type safety for navigation items and section management
 */

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  fragment?: string;
  isExternal?: boolean;
}

export interface Section {
  id: string;
  name: string;
  element?: HTMLElement;
  isVisible?: boolean;
}

export interface ScrollToOptions {
  sectionId: string;
  behavior?: ScrollBehavior;
  offset?: number;
}