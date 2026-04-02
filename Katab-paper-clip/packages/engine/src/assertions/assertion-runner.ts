import type { AssertionResult, AssertionType, AssertionDefinition } from "@katab/types";
import type { Page } from "playwright";

export type { AssertionType, AssertionDefinition };

export class AssertionRunner {
  constructor(private page: Page) {}

  async run(assertion: AssertionDefinition): Promise<AssertionResult> {
    try {
      switch (assertion.type) {
        case "element-visible": {
          const el = this.page.locator(assertion.selector!);
          const visible = await el.isVisible();
          return this.result(assertion, visible, visible);
        }

        case "element-hidden": {
          const el = this.page.locator(assertion.selector!);
          const hidden = !(await el.isVisible());
          return this.result(assertion, hidden, hidden);
        }

        case "text-contains": {
          const text = await this.page.locator(assertion.selector!).textContent();
          const contains = text?.includes(String(assertion.expected)) ?? false;
          return this.result(assertion, contains, text);
        }

        case "text-equals": {
          const text = await this.page.locator(assertion.selector!).textContent();
          const equals = text?.trim() === String(assertion.expected);
          return this.result(assertion, equals, text);
        }

        case "url-contains": {
          const url = this.page.url();
          return this.result(assertion, url.includes(String(assertion.expected)), url);
        }

        case "url-equals": {
          const url = this.page.url();
          return this.result(assertion, url === String(assertion.expected), url);
        }

        case "title-contains": {
          const title = await this.page.title();
          return this.result(assertion, title.includes(String(assertion.expected)), title);
        }

        case "title-equals": {
          const title = await this.page.title();
          return this.result(assertion, title === String(assertion.expected), title);
        }

        case "element-count": {
          const count = await this.page.locator(assertion.selector!).count();
          return this.result(assertion, count === Number(assertion.expected), count);
        }

        default:
          return {
            type: assertion.type,
            expected: assertion.expected,
            actual: null,
            passed: false,
            message: `Unknown assertion type: ${assertion.type}`,
          };
      }
    } catch (err) {
      return {
        type: assertion.type,
        expected: assertion.expected,
        actual: null,
        passed: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private result(
    assertion: AssertionDefinition,
    passed: boolean,
    actual: unknown,
  ): AssertionResult {
    return {
      type: assertion.type,
      expected: assertion.expected,
      actual,
      passed,
    };
  }
}
