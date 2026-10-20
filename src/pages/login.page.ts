import { expect } from '@playwright/test';
import type { TestUser } from '../helpers/user-factory';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly submit = this.byId('auth-submit');
  readonly error = this.byId('auth-error');

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.submit).toBeVisible();
  }

  async signUp(user: TestUser): Promise<void> {
    await this.byId('auth-tab-up').click();
    await this.byId('auth-name').fill(user.name);
    await this.byId('auth-email').fill(user.email);
    await this.byId('auth-password').fill(user.password);
    await this.submit.click();
    user.created = true;
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.byId('auth-tab-in').click();
    await this.byId('auth-email').fill(email);
    await this.byId('auth-password').fill(password);
    await this.submit.click();
  }

  async expectError(message?: RegExp | string): Promise<void> {
    await expect(this.error).toBeVisible();
    if (message) await expect(this.error).toContainText(message);
  }
}
