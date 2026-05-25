import { Injectable, Logger } from '@nestjs/common';
import { chromium, BrowserContext, Page } from 'playwright';

@Injectable()
export class LinkedinScraperService {
  private readonly logger = new Logger(LinkedinScraperService.name);

  async scrapeProfile(linkedinUrl: string, liAtCookie: string): Promise<any> {
    this.logger.log(`Starting scrape for ${linkedinUrl}`);
    let context: BrowserContext | null = null;

    try {
      const browser = await chromium.launch({
        headless: true, // Use false if you need to debug visually
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
      });

      context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      });

      // Inject the li_at session cookie
      await context.addCookies([{
        name: 'li_at',
        value: liAtCookie,
        domain: '.www.linkedin.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      }]);

      const page = await context.newPage();

      // Go to LinkedIn profile
      await page.goto(linkedinUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Check if logged in (if we see "Join now" or "Sign in" we failed)
      const isLoggedOut = await page.evaluate(() => {
        return !!document.querySelector('.authwall-join-form__title') || !!document.querySelector('form[action*="login"]');
      });

      if (isLoggedOut) {
        throw new Error('LinkedIn Session Cookie (li_at) is invalid or expired.');
      }

      // Wait for main profile element to load
      await page.waitForSelector('.pv-top-card', { timeout: 30000 }).catch(() => {});
      
      // Basic smooth scroll down to trigger lazy loading of Experience/Education
      await this.autoScroll(page);

      // Extract Data
      const profileData = await page.evaluate(() => {
        const getElementText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || null;
        
        // Basic Info
        const name = getElementText('h1.text-heading-xlarge');
        const headline = getElementText('.text-body-medium.break-words');
        const location = getElementText('.text-body-small.inline.t-black--light.break-words');
        const about = getElementText('#about ~ .display-flex .visually-hidden') || getElementText('.pv-about-section .visually-hidden'); // The "about" section

        // Extract Experience
        const experience: any[] = [];
        const expSection = document.querySelector('#experience')?.closest('section');
        if (expSection) {
          const expItems = expSection.querySelectorAll('.pvs-list__paged-details-item');
          expItems.forEach(item => {
            const title = item.querySelector('.mr1.t-bold span[aria-hidden="true"]')?.textContent?.trim();
            const company = item.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();
            const dates = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]')?.textContent?.trim();
            if (title && company) experience.push({ title, company, dates });
          });
        }

        // Extract Education
        const education: any[] = [];
        const eduSection = document.querySelector('#education')?.closest('section');
        if (eduSection) {
          const eduItems = eduSection.querySelectorAll('.pvs-list__paged-details-item');
          eduItems.forEach(item => {
            const school = item.querySelector('.mr1.t-bold span[aria-hidden="true"]')?.textContent?.trim();
            const degree = item.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();
            if (school) education.push({ school, degree });
          });
        }

        return { name, headline, location, about, experience, education };
      });

      this.logger.log(`Scraping complete for ${linkedinUrl}`);
      await browser.close();
      return profileData;
    } catch (error) {
      this.logger.error(`Scraping failed: ${error}`);
      if (context) await context.browser()?.close();
      throw error;
    }
  }

  // Helper to scroll page and trigger lazy-loaded sections
  private async autoScroll(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight || totalHeight > 5000) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });
  }
}
