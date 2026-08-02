/**
 * The single point of contact the public pages quote.
 *
 * Declared once so that a change of mailbox is one edit rather than eight, and
 * so that no page invents an address of its own. There is deliberately one
 * address rather than a wall of departmental aliases: a subject line routes a
 * message just as well, and a published alias that nobody reads is worse than
 * no alias at all.
 */

export const CONTACT_EMAIL = 'tax@ghimtech.org';

export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

/**
 * The reply window we intend to hold ourselves to. Stated as an intention on
 * every page that quotes it — it is not a service level and must never be
 * written as one.
 */
export const RESPONSE_INTENT = 'one business day, and rarely more than three';
