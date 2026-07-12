# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.test.ts >> Accessibility >> Login page should not have any automatically detectable accessibility issues
- Location: tests\e2e\accessibility.test.ts:14:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 211

- Array []
+ Array [
+   Object {
+     "description": "Ensure buttons have discernible text",
+     "help": "Buttons must have discernible text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/button-name?application=playwright",
+     "id": "button-name",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "button-has-visible-text",
+             "impact": "critical",
+             "message": "Element does not have inner text that is visible to screen readers",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "implicit-label",
+             "impact": "critical",
+             "message": "Element does not have an implicit (wrapped) <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "explicit-label",
+             "impact": "critical",
+             "message": "Element does not have an explicit <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have inner text that is visible to screen readers
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element does not have an implicit (wrapped) <label>
+   Element does not have an explicit <label>
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<button type=\"button\" class=\"absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".absolute",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.name-role-value",
+       "wcag2a",
+       "wcag412",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT6.a",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "ACT",
+       "RGAAv4",
+       "RGAA-11.9.1",
+     ],
+   },
+   Object {
+     "description": "Ensure the order of headings is semantically correct",
+     "help": "Heading levels should only increase by one",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/heading-order?application=playwright",
+     "id": "heading-order",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "heading-order",
+             "impact": "moderate",
+             "message": "Heading order invalid",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Heading order invalid",
+         "html": "<h3 class=\"text-lg font-bold text-blue-700 tracking-tight mb-3\">MathsLK</h3>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".text-lg",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure the document has at most one contentinfo landmark",
+     "help": "Document should not have more than one contentinfo landmark",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/landmark-no-duplicate-contentinfo?application=playwright",
+     "id": "landmark-no-duplicate-contentinfo",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "page-no-duplicate-contentinfo",
+             "impact": "moderate",
+             "message": "Document has more than one contentinfo landmark",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<footer class=\"border-t border-blue-100 bg-white/90\">",
+                 "target": Array [
+                   ".bg-white\\/90",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Document has more than one contentinfo landmark",
+         "html": "<footer class=\"border-t border-blue-100 bg-white/80\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "footer:nth-child(5)",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure landmarks are unique",
+     "help": "Landmarks should have a unique role or role/label/title (i.e. accessible name) combination",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/landmark-unique?application=playwright",
+     "id": "landmark-unique",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "accessibleText": null,
+               "role": "contentinfo",
+             },
+             "id": "landmark-is-unique",
+             "impact": "moderate",
+             "message": "The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<footer class=\"border-t border-blue-100 bg-white/90\">",
+                 "target": Array [
+                   ".bg-white\\/90",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+         "html": "<footer class=\"border-t border-blue-100 bg-white/80\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "footer:nth-child(5)",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "AV Classes Logo Amal Viduranga Classes" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "AV Classes Logo" [ref=e6]
        - generic [ref=e7]: Amal Viduranga Classes
      - generic [ref=e8]:
        - link "About" [ref=e9] [cursor=pointer]:
          - /url: /about
        - link "Results" [ref=e10] [cursor=pointer]:
          - /url: /results
        - link "Schedule" [ref=e11] [cursor=pointer]:
          - /url: /schedule
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
        - link "Student Login" [ref=e13] [cursor=pointer]:
          - /url: /login
  - main [ref=e14]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - img "AV Classes Logo" [ref=e19]
        - heading "Student Portal Login" [level=1] [ref=e20]
        - paragraph [ref=e21]: Sign in to access your classes, study materials, and recordings. Accounts are securely created by your instructor.
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: Email Address
          - textbox "Email Address" [ref=e25]:
            - /placeholder: your.email@example.com
        - generic [ref=e26]:
          - generic [ref=e27]: Password
          - generic [ref=e28]:
            - textbox "Password" [ref=e29]:
              - /placeholder: Enter your password
            - button [ref=e30] [cursor=pointer]:
              - img [ref=e31]
        - button "Sign In" [ref=e34] [cursor=pointer]
      - link "Forgot password?" [ref=e36] [cursor=pointer]:
        - /url: /forgot-password
      - paragraph [ref=e38]:
        - text: Don't have an account?
        - link "Contact us" [ref=e39] [cursor=pointer]:
          - /url: /contact
        - text: to request access.
  - contentinfo [ref=e40]:
    - generic [ref=e41]:
      - generic [ref=e42]:
        - heading "MathsLK" [level=3] [ref=e43]
        - paragraph [ref=e44]: Master A/L Mathematics with confidence through structured learning, clear theories, and comprehensive past papers.
        - generic [ref=e45]:
          - link "YouTube" [ref=e46] [cursor=pointer]:
            - /url: https://www.youtube.com/@amalvidu
            - img [ref=e47]
          - link "Facebook" [ref=e49] [cursor=pointer]:
            - /url: https://www.facebook.com/share/1FadraTpVk/
            - img [ref=e50]
      - generic [ref=e52]:
        - heading "Quick Links" [level=3] [ref=e53]
        - generic [ref=e54]:
          - link "Home" [ref=e55] [cursor=pointer]:
            - /url: /
          - link "About Teacher" [ref=e56] [cursor=pointer]:
            - /url: /about
          - link "Previous Results" [ref=e57] [cursor=pointer]:
            - /url: /results
          - link "Class Schedule" [ref=e58] [cursor=pointer]:
            - /url: /schedule
          - link "Contact" [ref=e59] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e60]:
        - heading "Student Access" [level=3] [ref=e61]
        - generic [ref=e62]:
          - link "Student Login" [ref=e63] [cursor=pointer]:
            - /url: /login
          - link "Dashboard" [ref=e64] [cursor=pointer]:
            - /url: /dashboard
      - generic [ref=e65]:
        - heading "Legal" [level=3] [ref=e66]
        - generic [ref=e67]:
          - link "Privacy Policy" [ref=e68] [cursor=pointer]:
            - /url: /privacy-policy
          - link "Terms & Conditions" [ref=e69] [cursor=pointer]:
            - /url: /terms-and-conditions
  - contentinfo [ref=e70]:
    - generic [ref=e71]:
      - paragraph [ref=e72]: © 2026 Amal Viduranga. All rights reserved.
      - generic [ref=e73]:
        - link "Privacy" [ref=e74] [cursor=pointer]:
          - /url: /privacy-policy
        - generic [ref=e75]: "|"
        - link "Terms" [ref=e76] [cursor=pointer]:
          - /url: /terms-and-conditions
        - generic [ref=e77]: "|"
        - link "Designed by Amal Viduranga" [ref=e78] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/amal-viduranga-3a681b27b
  - button "Open Next.js Dev Tools" [ref=e84] [cursor=pointer]:
    - img [ref=e85]
  - alert [ref=e88]
  - generic [ref=e90]:
    - button "Close promotion" [ref=e91] [cursor=pointer]
    - img "Promotion" [ref=e95] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test.describe('Accessibility', () => {
  5  |   test('Home page should not have any automatically detectable accessibility issues', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     
  8  |     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  9  |     
  10 |     // If there are issues, this will fail the test and list the violations
  11 |     expect(accessibilityScanResults.violations).toEqual([]);
  12 |   });
  13 | 
  14 |   test('Login page should not have any automatically detectable accessibility issues', async ({ page }) => {
  15 |     await page.goto('/login');
  16 |     
  17 |     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
> 18 |     expect(accessibilityScanResults.violations).toEqual([]);
     |                                                 ^ Error: expect(received).toEqual(expected) // deep equality
  19 |   });
  20 | });
  21 | 
```