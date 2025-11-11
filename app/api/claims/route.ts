/**
 * Claims API Route
 * 
 * POST /api/claims - Create new claim/request for hardware
 * GET /api/claims - Get claims (filtered by user or listing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');
    const user = await getCurrentUser();

if (!user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

    let sql = `
      SELECT 
        c.id, c.listing_id as "listingId", c.requesting_department as "requestingDepartment",
        c.justification, c.status, c.requested_by as "requestedBy", c.requested_at as "requestedAt",
        c.owner_approved_at as "ownerApprovedAt", c.owner_approved_by as "ownerApprovedBy",
        c.security_approved_at as "securityApprovedAt", c.security_approved_by as "securityApprovedBy",
        c.denied_at as "deniedAt", c.denied_by as "deniedBy", c.denial_reason as "denialReason",
        l.title as "listingTitle", l.serial_number as "serialNumber", l.category
      FROM claims c
      JOIN listings l ON c.listing_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (listingId) {
      sql += ` AND c.listing_id = $${paramCount}`;
      params.push(parseInt(listingId));
      paramCount++;
    }

    sql += ' ORDER BY c.requested_at DESC';

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();

if (!user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

    const { listingId, justification } = body;

    // Validate required fields
    if (!listingId || !justification) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if listing exists and is available
    const listingResult = await query(
      'SELECT id, status, department FROM listings WHERE id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listing = listingResult.rows[0];

    if (listing.status !== 'available') {
      return NextResponse.json(
        { error: 'Listing is not available for claiming' },
        { status: 400 }
      );
    }

    // Check if user's department already has a pending claim
    const existingClaimResult = await query(
      `SELECT id FROM claims 
       WHERE listing_id = $1 
       AND requesting_department = $2 
       AND status NOT IN ('denied')`,
      [listingId, user.department]
    );

    if (existingClaimResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Your department already has a pending claim for this hardware' },
        { status: 409 }
      );
    }

    // Create claim
    const result = await query(
      `INSERT INTO claims (
        listing_id, requesting_department, justification, requested_by, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id, listing_id as "listingId", requesting_department as "requestingDepartment",
        justification, status, requested_by as "requestedBy", requested_at as "requestedAt"
      `,
      [listingId, user.department, justification, user.id, 'pending_owner']
    );

    // Update listing status to claimed
    await query(
      'UPDATE listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['claimed', listingId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}
