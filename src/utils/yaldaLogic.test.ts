import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFee,
  clampGuests,
  computeCapacityState,
  generateTrackingCode,
  toFa,
  validateStep2,
} from './yaldaLogic';
import {
  AZAR_1405_MONTH,
  DEC_2026_MONTH,
  generateYaldaIcsContent,
} from './yaldaCalendar';
import { buildYaldaSharePayload, getSocialShareLinks } from './yaldaShare';
import { decodeGoogleCredential, isGoogleAuthConfigured } from './googleAuth';

test('toFa converts ASCII digits to Persian digits', () => {
  assert.equal(toFa(1405), '۱۴۰۵');
  assert.equal(toFa('53 / 80'), '۵۳ / ۸۰');
});

test('computeCapacityState handles normal, low, and full states', () => {
  const normal = computeCapacityState(80, 27);
  assert.equal(normal.remaining, 53);
  assert.equal(normal.isLow, false);
  assert.equal(normal.isFull, false);
  assert.equal(normal.percentFilled, 34);

  const low = computeCapacityState(80, 70);
  assert.equal(low.remaining, 10);
  assert.equal(low.isLow, true);
  assert.equal(low.isFull, false);

  const full = computeCapacityState(80, 85);
  assert.equal(full.remaining, 0);
  assert.equal(full.booked, 80);
  assert.equal(full.isFull, true);
  assert.equal(full.isLow, false);
});

test('clampGuests and calculateFee bound guest count by remaining seats and 10', () => {
  assert.equal(clampGuests(0, 50), 1);
  assert.equal(clampGuests(15, 50), 10);
  assert.equal(clampGuests(6, 4), 4);
  assert.equal(calculateFee(3, 5), 15);
});

test('validateStep2 enforces name, email format, attendance, and GDPR consent', () => {
  const emptyName = validateStep2({
    fullName: '  ',
    email: 'a@b.com',
    attendance: 'کل برنامه',
    photoConsent: 'موافق',
  });
  assert.equal(emptyName.valid, false);
  assert.equal(emptyName.errorField, 'fullName');

  const badEmail = validateStep2({
    fullName: 'سارا',
    email: 'not-an-email',
    attendance: 'کل برنامه',
    photoConsent: 'موافق',
  });
  assert.equal(badEmail.valid, false);
  assert.equal(badEmail.errorField, 'email');

  const noAttendance = validateStep2({
    fullName: 'سارا',
    email: 'sara@example.com',
    attendance: '',
    photoConsent: 'موافق',
  });
  assert.equal(noAttendance.valid, false);
  assert.equal(noAttendance.errorField, 'attendance');

  const noConsent = validateStep2({
    fullName: 'سارا',
    email: 'sara@example.com',
    attendance: 'کل برنامه',
    photoConsent: '',
  });
  assert.equal(noConsent.valid, false);
  assert.equal(noConsent.errorField, 'photoConsent');

  const ok = validateStep2({
    fullName: 'سارا محمدی',
    email: 'sara@example.com',
    attendance: 'کل برنامه',
    photoConsent: 'موافق',
  });
  assert.equal(ok.valid, true);
});

test('generateTrackingCode formats YLD-XXXXX codes deterministically when seeded', () => {
  assert.equal(generateTrackingCode(() => 0), 'YLD-10000');
  assert.equal(generateTrackingCode(() => 0.5), 'YLD-55000');
});

test('Azar 1405 and Dec 2026 calendars align event days and generate valid ICS content', () => {
  assert.equal(AZAR_1405_MONTH.cells[0], null);
  assert.equal(AZAR_1405_MONTH.cells[1], 1);
  assert.equal(AZAR_1405_MONTH.cells[29], 29);
  assert.equal(AZAR_1405_MONTH.eventDay, 29);

  assert.equal(DEC_2026_MONTH.cells[0], null);
  assert.equal(DEC_2026_MONTH.cells[1], 1);
  assert.equal(DEC_2026_MONTH.cells[20], 20);
  assert.equal(DEC_2026_MONTH.eventDay, 20);

  const ics = generateYaldaIcsContent();
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('DTSTART:20261220T133000Z'));
  assert.ok(ics.includes('Roihuvuori Youth Centre, Prinssintie 1, 00820 Helsinki'));
});

test('Social share helpers compose Yalda message and valid platform URLs', () => {
  const payload = buildYaldaSharePayload('https://yalda.example.fi/');
  assert.ok(payload.text.includes('۲۹ آذر ۱۴۰۵'));
  assert.ok(payload.text.includes('Roihuvuori Youth Centre'));
  assert.ok(payload.fullMessage.includes('https://yalda.example.fi/'));

  const links = getSocialShareLinks('https://yalda.example.fi/');
  assert.ok(links.whatsapp.startsWith('https://wa.me/?text='));
  assert.ok(links.telegram.startsWith('https://t.me/share/url?'));
  assert.ok(links.x.startsWith('https://twitter.com/intent/tweet?text='));
  assert.ok(links.email.startsWith('mailto:?subject='));
});

function makeTestJwt(payload: Record<string, unknown>): string {
  const encodeBase64Url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
  return `${encodeBase64Url({ alg: 'RS256', typ: 'JWT' })}.${encodeBase64Url(payload)}.sig`;
}

test('decodeGoogleCredential extracts email, email_verified, and UTF-8 Persian name safely', () => {
  const token = makeTestJwt({
    email: 'sara@gmail.com',
    email_verified: true,
    name: 'سارا محمدی',
  });
  const decoded = decodeGoogleCredential(token);
  assert.deepEqual(decoded, {
    email: 'sara@gmail.com',
    emailVerified: true,
    name: 'سارا محمدی',
    picture: undefined,
  });

  assert.equal(decodeGoogleCredential('invalid.jwt'), null);
  assert.equal(decodeGoogleCredential('bad.!!!.sig'), null);
  assert.equal(decodeGoogleCredential(makeTestJwt({ name: 'No Email' })), null);
});

test('isGoogleAuthConfigured and validateStep2 enforce verified Google Sign-In when configured', () => {
  assert.equal(isGoogleAuthConfigured(''), false);
  assert.equal(isGoogleAuthConfigured('YOUR_GOOGLE_CLIENT_ID'), false);
  assert.equal(isGoogleAuthConfigured('123456-abc.apps.googleusercontent.com'), true);

  const missingGoogle = validateStep2(
    {
      fullName: 'سارا محمدی',
      email: 'sara@gmail.com',
      attendance: 'کل برنامه',
      photoConsent: 'موافق',
    },
    { requireGoogleAuth: true, googleVerified: false }
  );
  assert.equal(missingGoogle.valid, false);
  assert.equal(missingGoogle.errorField, 'googleAuth');

  const mismatchedEmail = validateStep2(
    {
      fullName: 'سارا محمدی',
      email: 'other@gmail.com',
      attendance: 'کل برنامه',
      photoConsent: 'موافق',
    },
    { requireGoogleAuth: true, googleVerified: true, verifiedEmail: 'sara@gmail.com' }
  );
  assert.equal(mismatchedEmail.valid, false);
  assert.equal(mismatchedEmail.errorField, 'googleAuth');

  const verifiedOk = validateStep2(
    {
      fullName: 'سارا محمدی',
      email: 'sara@gmail.com',
      attendance: 'کل برنامه',
      photoConsent: 'موافق',
    },
    { requireGoogleAuth: true, googleVerified: true, verifiedEmail: 'sara@gmail.com' }
  );
  assert.equal(verifiedOk.valid, true);
});
