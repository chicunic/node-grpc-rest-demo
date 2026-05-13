const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function expectValidUUID(uuid: string): void {
  expect(UUID_RE.test(uuid)).toBe(true);
}

export function expectValidISOString(dateString: string): void {
  const date = new Date(dateString);
  expect(date.getTime()).not.toBeNaN();
  expect(date.toISOString()).toBe(dateString);
}

export interface RestResponse<T = unknown> {
  status: number;
  body: T;
  headers: Headers;
}

export const restAssert = {
  expectSuccess(response: RestResponse, expectedStatus = 200): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
  },

  expectError(response: RestResponse, expectedStatus: number, expectedMessage?: string): void {
    expect(response.status).toBe(expectedStatus);
    const body = response.body as { detail?: string; title?: string };
    expect(body).toBeDefined();
    if (expectedMessage) {
      const haystack = `${body.title ?? ""} ${body.detail ?? ""}`;
      expect(haystack).toContain(expectedMessage);
    }
  },
};
