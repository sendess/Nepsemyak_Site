/**
 * Shows a spinner on the button that was pressed and ignores further presses until the page answers.
 * Buttons are never disabled: some carry the action name (`_action`), which would be lost.
 */

function clearBusy(form: HTMLFormElement) {
  delete form.dataset.busy;
  form.querySelectorAll('[aria-busy="true"]').forEach((el) => el.removeAttribute('aria-busy'));
  form.querySelectorAll('[aria-disabled="true"]').forEach((el) => el.removeAttribute('aria-disabled'));
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.hasAttribute('data-no-busy')) return;

  // A second press while the first is still going.
  if (form.dataset.busy === 'true') {
    event.preventDefault();
    return;
  }
  // The page handles this form itself (it called preventDefault), so it shows its own progress.
  if (event.defaultPrevented) return;

  form.dataset.busy = 'true';
  const submitter = (event as SubmitEvent).submitter;
  const pressed = submitter instanceof HTMLElement ? submitter : form.querySelector('button[type="submit"], button:not([type])');
  pressed?.setAttribute('aria-busy', 'true');
  // The other buttons in the same form shouldn't invite a press while we wait.
  form.querySelectorAll('button').forEach((button) => {
    if (button !== pressed) button.setAttribute('aria-disabled', 'true');
  });
});

// Coming back with the browser's Back button can restore a form still marked busy.
addEventListener('pageshow', () => {
  document.querySelectorAll<HTMLFormElement>('form[data-busy]').forEach(clearBusy);
});

/** For buttons outside a form (sign out) and forms the page submits itself. */
export function showBusy(element: HTMLElement | null | undefined) {
  element?.setAttribute('aria-busy', 'true');
}

export function hideBusy(element: HTMLElement | null | undefined) {
  element?.removeAttribute('aria-busy');
}
