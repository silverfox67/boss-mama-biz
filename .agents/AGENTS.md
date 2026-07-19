# Project-Scoped Rules

### HTML Layout and Tag Integrity
- **Validate Nesting**: When editing HTML files containing tabbed or toggled views (e.g., sections with `.dash-section`), always verify that all parent container tags (`<div>`, `<section>`, `<form>`) are fully and properly closed.
- **Troubleshoot Blank Screens**: If a section, component, or layout tab displays as empty or blank after navigation, immediately check the tag nesting of its preceding sibling sections to ensure they do not accidentally consume the target section.
