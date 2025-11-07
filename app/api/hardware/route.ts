/**
 * Hardware Lookup API Route
 * 
 * GET /api/hardware?serial={serialNumber}
 * Returns hardware specifications from mock API
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchHardwareSpecs, hasStorageMedia } from '@/lib/hardware-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serialNumber = searchParams.get('serial');

    if (!serialNumber) {
      return NextResponse.json(
        { error: 'Serial number is required' },
        { status: 400 }
      );
    }

    const specs = await fetchHardwareSpecs(serialNumber);

    if (!specs) {
      return NextResponse.json(
        { error: 'Hardware not found', found: false },
        { status: 404 }
      );
    }

    // Check for storage media
    const hasStorage = hasStorageMedia(specs);

    return NextResponse.json({
      ...specs,
      hasStorageMedia: hasStorage,
      found: true
    });
  } catch (error) {
    console.error('Error fetching hardware specs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hardware specifications' },
      { status: 500 }
    );
  }
}
