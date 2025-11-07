/**
 * Listings API Route
 * 
 * GET /api/listings - List all hardware listings with optional filters
 * POST /api/listings - Create new hardware listing
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { fetchHardwareSpecs, hasStorageMedia, getStorageBlockMessage } from '@/lib/hardware-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const department = searchParams.get('department');

    let sql = `
      SELECT 
        id, serial_number as "serialNumber", title, category, description,
        location, condition, department, cpu, ram, storage, ports,
        other_specs as "otherSpecs", status, expiration_date as "expirationDate",
        created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM listings
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (category && category !== 'all') {
      sql += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (status) {
      sql += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      sql += ` AND (
        title ILIKE $${paramCount} OR 
        serial_number ILIKE $${paramCount} OR 
        department ILIKE $${paramCount} OR
        description ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (department) {
      sql += ` AND department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = getCurrentUser();

    const {
      serialNumber,
      title,
      category,
      description,
      location,
      condition,
      cpu,
      ram,
      storage,
      ports,
      otherSpecs,
      expirationDate,
    } = body;

    // Validate required fields
    if (!serialNumber || !title || !category || !expirationDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch hardware specs from API
    const hardwareSpecs = await fetchHardwareSpecs(serialNumber);
    
    if (!hardwareSpecs) {
      return NextResponse.json(
        { error: 'Serial number not found in hardware tracking system' },
        { status: 404 }
      );
    }

    // Check for storage media (security policy)
    if (hasStorageMedia(hardwareSpecs)) {
      return NextResponse.json(
        { 
          error: 'Hardware contains storage media',
          message: getStorageBlockMessage(hardwareSpecs),
          blocked: true
        },
        { status: 403 }
      );
    }

    // Insert listing
    const result = await query(
      `INSERT INTO listings (
        serial_number, title, category, description, location, condition,
        department, cpu, ram, storage, ports, other_specs, expiration_date,
        created_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING 
        id, serial_number as "serialNumber", title, category, description,
        location, condition, department, cpu, ram, storage, ports,
        other_specs as "otherSpecs", status, expiration_date as "expirationDate",
        created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      `,
      [
        serialNumber,
        title,
        category,
        description,
        location,
        condition,
        user.department,
        cpu,
        ram,
        storage,
        ports,
        otherSpecs,
        expirationDate,
        user.id,
        'available'
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Hardware with this serial number is already listed' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
