import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const GOALS_PATH = path.join(process.cwd(), 'data', 'feature-goals.json')

export async function GET() {
  try {
    const content = await fs.readFile(GOALS_PATH, 'utf-8')
    const goals = JSON.parse(content)
    return NextResponse.json({ goals })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load feature goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    if (!payload || !Array.isArray(payload.goals)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    await fs.writeFile(GOALS_PATH, JSON.stringify(payload.goals, null, 2), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update feature goals' }, { status: 500 })
  }
}
