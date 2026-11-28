import { NextRequest, NextResponse } from 'next/server';

const SPREADSHEET_ID_RE = /^[a-zA-Z0-9_-]{10,128}$/;

function extractBearer(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 20) {
    return null;
  }
  return authHeader;
}

export async function GET(req: NextRequest) {
  const token = extractBearer(req);
  if (!token) {
    return NextResponse.json({ error: 'Missing or invalid Bearer token.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'metadata';
  const spreadsheetId = searchParams.get('spreadsheetId') || '';

  if (!SPREADSHEET_ID_RE.test(spreadsheetId)) {
    return NextResponse.json({ error: 'Invalid spreadsheetId format.' }, { status: 400 });
  }

  try {
    if (action === 'metadata') {
      const fields = encodeURIComponent(
        'spreadsheetId,spreadsheetUrl,properties.title,sheets.properties(sheetId,title,index)'
      );
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=${fields}`,
        { headers: { Authorization: token }, cache: 'no-store' }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'Failed to read spreadsheet metadata.' },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    if (action === 'batchGet') {
      const ranges = searchParams.getAll('ranges');
      if (ranges.length === 0 || ranges.length > 15) {
        return NextResponse.json({ error: 'Invalid ranges parameter.' }, { status: 400 });
      }
      const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${query}`,
        { headers: { Authorization: token }, cache: 'no-store' }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'Failed to read spreadsheet ranges.' },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unable to reach Google Sheets API.' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const token = extractBearer(req);
  if (!token) {
    return NextResponse.json({ error: 'Missing or invalid Bearer token.' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = typeof body.action === 'string' ? body.action : '';

    if (action === 'create') {
      const title =
        typeof body.title === 'string' && body.title.trim()
          ? body.title.trim().slice(0, 140)
          : 'KOTO — Minna Database & Learner Ledger';
      const tabTitles = Array.isArray(body.tabTitles)
        ? body.tabTitles
            .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
            .slice(0, 12)
        : ['Users', 'Progress'];

      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title },
          sheets: tabTitles.map((t, index) => ({
            properties: { title: t, index },
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'Failed to create spreadsheet.' },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    const spreadsheetId = typeof body.spreadsheetId === 'string' ? body.spreadsheetId : '';
    if (!SPREADSHEET_ID_RE.test(spreadsheetId)) {
      return NextResponse.json({ error: 'Invalid spreadsheetId format.' }, { status: 400 });
    }

    if (action === 'addTabs') {
      const tabTitles = Array.isArray(body.tabTitles)
        ? body.tabTitles
            .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
            .slice(0, 12)
        : [];
      if (tabTitles.length === 0) {
        return NextResponse.json({ ok: true });
      }
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: tabTitles.map((t) => ({
              addSheet: { properties: { title: t } },
            })),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'Failed to initialize missing tabs.' },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    if (action === 'batchClear') {
      const ranges = Array.isArray(body.ranges)
        ? body.ranges.filter((r): r is string => typeof r === 'string').slice(0, 15)
        : [];
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`,
        {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ranges }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'Failed to clear sheet ranges.' },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    if (action === 'batchWrite') {
      const valueRanges = Array.isArray(body.valueRanges) ? body.valueRanges.slice(0, 15) : [];
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: valueRanges,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'Failed to write spreadsheet values.' },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    if (action === 'appendLog') {
      const values = Array.isArray(body.values) ? body.values.slice(0, 5) : [];
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          'Sync_Logs!A1'
        )}:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'Failed to append sync log.' },
          { status: res.status }
        );
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unable to reach Google Sheets API.' }, { status: 502 });
  }
}
