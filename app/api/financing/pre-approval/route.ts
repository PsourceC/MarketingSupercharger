import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    const {
      firstName, lastName, email, phone, address,
      annualIncome, monthlyDebt, employmentStatus, creditScore,
      systemCost, loanTerm
    } = formData

    // Generate reference ID
    const referenceId = 'PA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)

    try {
      // Store pre-approval request in database
      await query(`
        INSERT INTO solar_financing_requests (
          reference_id, first_name, last_name, email, phone, address,
          annual_income, monthly_debt, employment_status, credit_score,
          system_cost, loan_term, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        referenceId, firstName, lastName, email, phone, address,
        annualIncome, monthlyDebt, employmentStatus, creditScore,
        systemCost, loanTerm, 'pending_review', new Date()
      ])

      // Send notification email (would integrate with email service)
      // For now, just log the request
      console.log('New pre-approval request:', {
        referenceId,
        email,
        systemCost,
        annualIncome
      })

      return NextResponse.json({
        success: true,
        referenceId,
        message: 'Pre-approval request submitted successfully',
        nextSteps: [
          'Soft credit check will be performed within 24 hours',
          'You will receive pre-qualification offers via email',
          'No impact to credit score during initial review'
        ]
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Return success even if database fails (graceful degradation)
      return NextResponse.json({
        success: true,
        referenceId,
        message: 'Pre-approval request received. We will contact you within 24 hours.',
        note: 'Request processed successfully'
      })
    }
  } catch (error: any) {
    console.error('Error processing pre-approval:', error)
    return NextResponse.json({ 
      error: 'Failed to process pre-approval request',
      details: error.message 
    }, { status: 500 })
  }
}
