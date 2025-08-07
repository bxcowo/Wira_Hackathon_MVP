/**
 * Landing page interfaces for TransitAI application
 * Defines data models for landing page content and statistics
 */

export interface HeroStat {
  number: string;
  label: string;
}

export interface TeamCard {
  icon: string;
  emoticon?: string;
  title: string;
  description: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface BenefitCard {
  icon: string;
  title: string;
  description: string;
}

export interface TechItem {
  icon: string;
  label: string;
}

export interface ProcessStep {
  number: number;
  label: string;
}

export interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
  isPrimary?: boolean;
}

export interface ContactMethod {
  icon: string;
  title: string;
  value: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  ariaLabel: string;
  icon: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  organization?: string;
  message: string;
}