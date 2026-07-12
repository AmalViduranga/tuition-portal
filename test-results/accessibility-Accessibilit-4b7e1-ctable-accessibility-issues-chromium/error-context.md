# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.test.ts >> Accessibility >> Home page should not have any automatically detectable accessibility issues
- Location: tests\e2e\accessibility.test.ts:5:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 85

- Array []
+ Array [
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
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e21]: ∫
        - generic [ref=e22]: ∑
        - generic [ref=e23]: π
        - generic [ref=e24]: ∞
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]: "#1 A/L Maths Sri Lanka"
              - generic [ref=e31]: 2028 Intake Now Open
            - heading "Master A/L Mathematics (07) with Confidence" [level=1] [ref=e33]:
              - text: Master A/L Mathematics (07) with
              - text: Confidence
            - paragraph [ref=e34]:
              - text: Join the most comprehensive structured lesson delivery with
              - strong [ref=e35]: Amal Viduranga
              - text: . Clear concepts, proven results, and individual guidance.
            - generic [ref=e36]:
              - link "Join the Class" [ref=e37] [cursor=pointer]:
                - /url: /contact
                - generic [ref=e39]:
                  - text: Join the Class
                  - img [ref=e40]
              - link "WhatsApp Us" [ref=e42] [cursor=pointer]:
                - /url: https://wa.me/94753681070
                - img [ref=e43]
                - text: WhatsApp Us
          - generic [ref=e46]:
            - generic [ref=e48]:
              - img [ref=e50]
              - generic [ref=e54]:
                - generic [ref=e55]: Learning System
                - generic [ref=e56]: Everything you need
            - generic [ref=e61]:
              - generic [ref=e62]:
                - generic [ref=e63]:
                  - img [ref=e64]
                  - generic [ref=e67]: Recordings
                - generic [ref=e68]: Watch lessons anytime
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - img [ref=e71]
                  - generic [ref=e77]: Materials
                - generic [ref=e78]: Tutes, papers & notes
              - generic [ref=e79]:
                - generic [ref=e80]:
                  - img [ref=e81]
                  - generic [ref=e84]: Schedule
                - generic [ref=e85]: Plan your study week
              - generic [ref=e86]:
                - generic [ref=e87]:
                  - img [ref=e88]
                  - generic [ref=e93]: Guidance
                - generic [ref=e94]: Individual support
      - generic [ref=e98]:
        - generic [ref=e99]:
          - img [ref=e101]
          - heading "Highest" [level=2] [ref=e104]
          - paragraph [ref=e105]: Z-Score (2.80+)
        - generic [ref=e106]:
          - img [ref=e108]
          - heading "100%" [level=2] [ref=e111]
          - paragraph [ref=e112]: Pass Rate in 2024
        - generic [ref=e113]:
          - img [ref=e115]
          - heading "Individual" [level=3] [ref=e120]
          - paragraph [ref=e121]: Student Attention
      - generic [ref=e122]:
        - generic [ref=e123]:
          - heading "Why Choose This Class?" [level=2] [ref=e124]
          - paragraph [ref=e125]: A structured approach to mastering A/L Mathematics with clarity and confidence.
        - generic [ref=e126]:
          - generic [ref=e127]:
            - img [ref=e129]
            - img [ref=e132]
            - paragraph [ref=e135]: Comprehensive coverage of the A/L Mathematics syllabus with clear and structured lesson delivery
          - generic [ref=e136]:
            - img [ref=e138]
            - img [ref=e141]
            - paragraph [ref=e144]: Focus on concept clarity, problem-solving techniques, and exam-oriented strategies
          - generic [ref=e145]:
            - img [ref=e147]
            - img [ref=e150]
            - paragraph [ref=e153]: Discussion of all past paper questions in each and every lesson
          - generic [ref=e154]:
            - img [ref=e156]
            - img [ref=e159]
            - paragraph [ref=e162]: Regular revision sessions and model paper discussions
          - generic [ref=e163]:
            - img [ref=e165]
            - img [ref=e168]
            - paragraph [ref=e171]: Step-by-step explanations for complex problems
          - generic [ref=e172]:
            - img [ref=e174]
            - img [ref=e177]
            - paragraph [ref=e180]: Special attention to weak students and individual guidance
      - generic [ref=e182]:
        - generic [ref=e183]:
          - generic [ref=e184]:
            - img [ref=e185]
            - text: About the Teacher
          - heading "Amal Viduranga" [level=2] [ref=e187]
          - paragraph [ref=e189]: BSc. (Hons) in Information Technology (Undergraduate) – University of Moratuwa
          - paragraph [ref=e190]: "Achieved 3A passes for Mathematics, Engineering Technology, and Science for Technology. Highest Z-Score: 2.8075. Colombo District 2nd and All Island 30th."
          - link "Read Full Profile" [ref=e191] [cursor=pointer]:
            - /url: /about
            - text: Read Full Profile
            - img [ref=e192]
        - generic [ref=e194]:
          - img [ref=e197]
          - heading "Teaching Philosophy" [level=3] [ref=e200]
          - list [ref=e201]:
            - listitem [ref=e202]:
              - img [ref=e204]
              - generic [ref=e206]: Simplify difficult concepts to build strong foundations
            - listitem [ref=e207]:
              - img [ref=e209]
              - generic [ref=e211]: Use modern, interactive teaching methods
            - listitem [ref=e212]:
              - img [ref=e214]
              - generic [ref=e216]: Provide continuous support and doubt-clearing sessions
      - generic [ref=e217]:
        - generic [ref=e218]:
          - generic [ref=e219]:
            - heading "Proven Results" [level=2] [ref=e220]
            - paragraph [ref=e221]: Our students consistently achieve excellence and secure top university placements.
          - link "View All Results" [ref=e222] [cursor=pointer]:
            - /url: /results
        - generic [ref=e223]:
          - generic [ref=e224]:
            - generic [ref=e225]:
              - 'heading "First batch: 2024 A/L Batch" [level=3] [ref=e226]'
              - generic [ref=e227]: 11 Students
            - paragraph [ref=e229]: 3 A passes, 6 B passes, and 3 C passes
            - list [ref=e230]:
              - listitem [ref=e231]:
                - generic [ref=e233]: Badulla District 3rd (Bio System Technology Stream)
              - listitem [ref=e234]:
                - generic [ref=e236]: Polonnaruwa District 8th (Engineering Technology Stream)
              - listitem [ref=e237]:
                - generic [ref=e239]: Nuwara Eliya District 18th (Art Stream)
          - generic [ref=e240]:
            - generic [ref=e242]:
              - img [ref=e243]
              - text: Latest
            - generic [ref=e245]:
              - 'heading "Second batch: 2025 A/L Batch" [level=3] [ref=e246]'
              - generic [ref=e247]: 20 Students
            - paragraph [ref=e249]: 5 A passes, 8 B passes, and 7 C passes
      - generic [ref=e251]:
        - generic [ref=e253]:
          - heading "Class Schedule" [level=2] [ref=e254]
          - paragraph [ref=e255]: Join the class that perfectly fits your schedule.
        - generic [ref=e256]:
          - generic [ref=e257]:
            - heading "2026 A/L Theory" [level=3] [ref=e258]
            - generic [ref=e259]:
              - generic [ref=e260]:
                - img [ref=e261]
                - generic [ref=e264]: Saturday, 7:00 PM - 10:00 PM
              - generic [ref=e265]:
                - img [ref=e266]
                - generic [ref=e269]: Online via Zoom
          - generic [ref=e270]:
            - heading "2026 A/L Revision" [level=3] [ref=e271]
            - generic [ref=e272]:
              - generic [ref=e273]:
                - img [ref=e274]
                - generic [ref=e277]: Sunday, 9:00 AM - 1:00 PM
              - generic [ref=e278]:
                - img [ref=e279]
                - generic [ref=e282]: Online via Zoom
          - generic [ref=e283]:
            - heading "2027 A/L Theory" [level=3] [ref=e284]
            - generic [ref=e285]:
              - generic [ref=e286]:
                - img [ref=e287]
                - generic [ref=e290]: Sunday, 7:00 PM - 9:30 PM
              - generic [ref=e291]:
                - img [ref=e292]
                - generic [ref=e295]: Online via Zoom
          - generic [ref=e296]:
            - heading "2028 A/L" [level=3] [ref=e297]
            - generic [ref=e298]:
              - generic [ref=e299]:
                - img [ref=e300]
                - generic [ref=e303]: Saturday, 3:00 PM - 5:00 PM
              - generic [ref=e304]:
                - img [ref=e305]
                - generic [ref=e308]: Online via Zoom
          - generic [ref=e309]:
            - heading "Paper Class" [level=3] [ref=e310]
            - generic [ref=e311]:
              - generic [ref=e312]:
                - img [ref=e313]
                - generic [ref=e316]: Flexible, Paper discussions given as recordings
              - generic [ref=e317]:
                - img [ref=e318]
                - generic [ref=e321]: Online via Website
        - link "See detailed schedule options" [ref=e323] [cursor=pointer]:
          - /url: /schedule
          - text: See detailed schedule options
          - img [ref=e324]
      - generic [ref=e330]:
        - heading "Ready to secure your A pass?" [level=2] [ref=e331]
        - paragraph [ref=e332]: Registration is open for the new intake. Get in touch with us to reserve your spot and begin your journey.
        - generic [ref=e333]:
          - link "Call Now" [ref=e334] [cursor=pointer]:
            - /url: tel:94753681070
            - img [ref=e335]
            - text: Call Now
          - link "Contact Methods" [ref=e337] [cursor=pointer]:
            - /url: /contact
            - text: Contact Methods
            - img [ref=e338]
  - contentinfo [ref=e340]:
    - generic [ref=e341]:
      - generic [ref=e342]:
        - heading "MathsLK" [level=3] [ref=e343]
        - paragraph [ref=e344]: Master A/L Mathematics with confidence through structured learning, clear theories, and comprehensive past papers.
        - generic [ref=e345]:
          - link "YouTube" [ref=e346] [cursor=pointer]:
            - /url: https://www.youtube.com/@amalvidu
            - img [ref=e347]
          - link "Facebook" [ref=e349] [cursor=pointer]:
            - /url: https://www.facebook.com/share/1FadraTpVk/
            - img [ref=e350]
      - generic [ref=e352]:
        - heading "Quick Links" [level=3] [ref=e353]
        - generic [ref=e354]:
          - link "Home" [ref=e355] [cursor=pointer]:
            - /url: /
          - link "About Teacher" [ref=e356] [cursor=pointer]:
            - /url: /about
          - link "Previous Results" [ref=e357] [cursor=pointer]:
            - /url: /results
          - link "Class Schedule" [ref=e358] [cursor=pointer]:
            - /url: /schedule
          - link "Contact" [ref=e359] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e360]:
        - heading "Student Access" [level=3] [ref=e361]
        - generic [ref=e362]:
          - link "Student Login" [ref=e363] [cursor=pointer]:
            - /url: /login
          - link "Dashboard" [ref=e364] [cursor=pointer]:
            - /url: /dashboard
      - generic [ref=e365]:
        - heading "Legal" [level=3] [ref=e366]
        - generic [ref=e367]:
          - link "Privacy Policy" [ref=e368] [cursor=pointer]:
            - /url: /privacy-policy
          - link "Terms & Conditions" [ref=e369] [cursor=pointer]:
            - /url: /terms-and-conditions
  - contentinfo [ref=e370]:
    - generic [ref=e371]:
      - paragraph [ref=e372]: © 2026 Amal Viduranga. All rights reserved.
      - generic [ref=e373]:
        - link "Privacy" [ref=e374] [cursor=pointer]:
          - /url: /privacy-policy
        - generic [ref=e375]: "|"
        - link "Terms" [ref=e376] [cursor=pointer]:
          - /url: /terms-and-conditions
        - generic [ref=e377]: "|"
        - link "Designed by Amal Viduranga" [ref=e378] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/amal-viduranga-3a681b27b
  - button "Open Next.js Dev Tools" [ref=e384] [cursor=pointer]:
    - img [ref=e385]
  - alert [ref=e388]
  - generic [ref=e390]:
    - button "Close promotion" [ref=e391] [cursor=pointer]
    - img "Promotion" [ref=e395] [cursor=pointer]
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
> 11 |     expect(accessibilityScanResults.violations).toEqual([]);
     |                                                 ^ Error: expect(received).toEqual(expected) // deep equality
  12 |   });
  13 | 
  14 |   test('Login page should not have any automatically detectable accessibility issues', async ({ page }) => {
  15 |     await page.goto('/login');
  16 |     
  17 |     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  18 |     expect(accessibilityScanResults.violations).toEqual([]);
  19 |   });
  20 | });
  21 | 
```