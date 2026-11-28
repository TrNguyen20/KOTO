export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 20) {
    return NextResponse.json({ error: 'Missing or invalid Bearer token.' }, { status: 401 });
  }

  try {
    const query = encodeURIComponent(
      "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
    );
    const fields = encodeURIComponent('files(id,name,webViewLink,modifiedTime)');
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=20`,
      {
        headers: { Authorization: authHeader },
        cache: 'no-store',
      }
    );
    const data = await driveRes.json();
    if (!driveRes.ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'Google Drive API request failed.' },
        { status: driveRes.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach Google Drive API.' },
      { status: 502 }
    );
  }
}
