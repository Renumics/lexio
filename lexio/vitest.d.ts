import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// jest-dom 6 augments the old Assertion interface; Vitest 5 uses Matchers.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- This interface augments Vitest's matchers.
  interface Matchers<R, T> extends TestingLibraryMatchers<T, R> {}
}
