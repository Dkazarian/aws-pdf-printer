# Phase 4 Requirements — Internationalization

## Objective

Add English and Spanish language support to the AWS PDF Printer interface. Users must be able to switch languages from the dashboard without changing the print workflow or the visual direction established in earlier phases.

This phase includes implementing the internationalization behavior in the production React UI and keeping the standalone mockup aligned with it.

## Localization approach

Use a small, typed translation map exposed through a custom React Context provider. This is appropriate for the current scope of two locales and avoids adding a dependency for capabilities the application does not yet need.

The implementation should not add a third-party localization library in this phase. Reconsider that decision if the product later needs several additional locales, pluralization rules, locale-aware date or number formatting, translation-management tooling, or locale-based routing.

## Supported languages

- English (`en`) is the default language.
- Spanish (`es`) is the only additional language in this phase.
- The language switch must clearly show the active language.
- Switching language must not clear entered text, reset job progress, or interrupt an active submission or polling cycle.

## Translation coverage

Every user-facing string in the dashboard must have an English and Spanish translation, including:

- Page title, supporting description, and language-control label.
- Service status label and service availability values where applicable.
- Text input label, placeholder, character count, submit button, and submitting state.
- Job progress heading, progress states, and accessible progress labels.
- AWS workflow heading and all workflow step descriptions.
- Success, validation, failure, and download messages shown by the UI.
- Download action and relevant accessible names or descriptions.

Technical values such as `ONLINE`, `SENDING`, or `COMPLETED` may remain stable internally, but their rendered labels must use the active locale.

## Interaction and accessibility

- The language switch must be keyboard accessible and expose the selected state to assistive technology.
- Text changes must update the document language metadata from `en` to `es` or back.
- The active language must have sufficient visual distinction from the inactive option.
- Translated text must preserve labels and relationships for the existing form, progress bar, workflow, error banner, and download control.
- Language changes must not introduce horizontal overflow at supported viewport widths.

## Persistence

- The selected language should persist for the current browser session or through a lightweight local preference.
- If no preference exists, the interface starts in English.
- Invalid or unavailable stored locale values must fall back to English.

## Scope constraints

- Do not add additional locales, automatic translation, or locale-specific routing in this phase.
- Do not change API contracts, AWS infrastructure, polling intervals, job states, or PDF generation behavior.
- Do not translate backend payload values or use translated strings as workflow state identifiers.
