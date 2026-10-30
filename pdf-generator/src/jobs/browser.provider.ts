import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer-core';

@Injectable()
export class BrowserProvider implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserProvider.name);
  private browserPromise: Promise<Browser> | null = null;

  get(): Promise<Browser> {
    if (!this.browserPromise) {
      this.browserPromise = puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/usr/bin/chromium',
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      }).then((b) => {
        b.on('disconnected', () => {
          this.logger.warn('Chromium disconnected; will relaunch on next job');
          this.browserPromise = null;
        });
        return b;
      });
    }
    return this.browserPromise;
  }

  async onModuleDestroy() {
    if (this.browserPromise) {
      const b = await this.browserPromise.catch(() => null);
      if (b) await b.close().catch(() => undefined);
    }
  }
}
