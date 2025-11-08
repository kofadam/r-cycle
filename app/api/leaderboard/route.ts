/**
 * Leaderboard API Route
 * 
 * GET /api/leaderboard - Get department environmental impact statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CARBON_FOOTPRINT } from '@/lib/environmental-impact';

export async function GET(request: NextRequest) {
  try {
    // Get statistics grouped by department
    const result = await query(`
      SELECT 
        department,
        COUNT(*) as items_posted,
        COUNT(CASE WHEN status = 'approved' OR status = 'claimed' THEN 1 END) as items_claimed
      FROM listings
      GROUP BY department
      ORDER BY COUNT(*) DESC
    `);

    // Calculate environmental impact for each department
    const stats = result.rows.map((row: any) => {
      // Get all listings for this department to calculate CO2 by category
      return query(`
        SELECT category, COUNT(*) as count
        FROM listings
        WHERE department = $1
        GROUP BY category
      `, [row.department]).then((categoryResult) => {
        // Calculate total CO2 saved
        const totalCO2 = categoryResult.rows.reduce((sum: number, cat: any) => {
          const co2PerItem = CARBON_FOOTPRINT[cat.category as keyof typeof CARBON_FOOTPRINT] || 500;
          return sum + (co2PerItem * cat.count);
        }, 0);

        return {
          department: row.department,
          itemsPosted: parseInt(row.items_posted),
          itemsClaimed: parseInt(row.items_claimed),
          totalCO2SavedKg: totalCO2,
          totalTreesEquivalent: Number((totalCO2 / 22).toFixed(1)), // 22 kg CO2 per tree per year
          totalPandasProtected: Number((totalCO2 / 40000).toFixed(4)), // 40,000 kg CO2 per panda habitat
          rank: 0, // Will be set after sorting
        };
      });
    });

    // Wait for all department stats to be calculated
    const departmentStats = await Promise.all(stats);

    // Sort by CO2 saved and add rank
    departmentStats.sort((a, b) => b.totalCO2SavedKg - a.totalCO2SavedKg);
    departmentStats.forEach((stat, index) => {
      stat.rank = index + 1;
    });

    return NextResponse.json(departmentStats);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
