import { PluggyClient } from 'pluggy-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const clientId = process.env.CLIENT_ID || process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET || process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'CLIENT_ID and CLIENT_SECRET environment variables are required' },
        { status: 500 }
      );
    }

    const pluggy = new PluggyClient({
      clientId,
      clientSecret,
    });

    let clientUserId: string | undefined = undefined;
    try {
      const body = await req.json();
      clientUserId = body?.clientUserId;
    } catch {
      // Optional body
    }

    const connectToken = await pluggy.createConnectToken({
      clientUserId,
    });

    return NextResponse.json({ accessToken: connectToken.accessToken });
  } catch (error: any) {
    console.error('Error creating Pluggy connect token:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create connect token' },
      { status: 500 }
    );
  }
}
