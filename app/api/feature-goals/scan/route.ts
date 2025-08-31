import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'app')
const GOALS_PATH = path.join(ROOT, 'data', 'feature-goals.json')

interface Evidence {
  file: string
  line: number
  snippet: string
}

async function readGoals() {
  const raw = await fs.readFile(GOALS_PATH, 'utf-8')
  return JSON.parse(raw) as Array<{ id: string; title: string; description: string; category: string; guidance: string }>
}

async function walk(dir: string, fileList: string[] = []) : Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.next')) continue
      await walk(full, fileList)
    } else if (entry.isFile()) {
      if (/\.(ts|tsx|js|jsx|css|md)$/.test(entry.name)) fileList.push(full)
    }
  }
  return fileList
}

async function searchInFile(filePath: string, regex: RegExp): Promise<Evidence[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  const lines = content.split(/\r?\n/)
  const results: Evidence[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (regex.test(line)) {
      results.push({ file: filePath.replace(ROOT + path.sep, ''), line: i + 1, snippet: line.trim().slice(0, 200) })
    }
  }
  return results
}

async function scannerEncoding(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const files = await walk(APP_DIR)
  const evidence: Evidence[] = []
  for (const f of files) {
    const hits = await searchInFile(f, /\ufffd|�/)
    evidence.push(...hits)
  }
  return { status: evidence.length === 0 ? 'achieved' : 'not_achieved', evidence }
}

async function scannerLegendConsistency(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const files = await walk(path.join(APP_DIR, 'components'))
  const badPatterns = [
    /Good\s*\(6\s*[-–]\s*15\)/i,
    /Good\s*\(6\s*[-–]\s*10\)/i,
    /Top\s*10\)/i
  ]
  const evidence: Evidence[] = []
  for (const f of files) {
    for (const pat of badPatterns) {
      const hits = await searchInFile(f, pat)
      evidence.push(...hits)
    }
  }
  return { status: evidence.length === 0 ? 'achieved' : 'not_achieved', evidence }
}

async function scannerQuickStatsTimestamp(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const files = await walk(path.join(APP_DIR, 'components'))
  const labelHits: Evidence[] = []
  for (const f of files) {
    labelHits.push(...await searchInFile(f, /Last\s*Update/i))
  }
  // verify nearby usage of rankStatus.lastUpdated in EnhancedGeoGrid
  const enhancedPath = path.join(APP_DIR, 'components', 'EnhancedGeoGrid.tsx')
  let correctUsage = false
  try {
    const content = await fs.readFile(enhancedPath, 'utf-8')
    correctUsage = /rankStatus\s*\.\s*lastUpdated/.test(content)
  } catch {}

  // if there are any 'Last Update' labels without lastUpdated nearby, mark warning/not_achieved
  const suspicious: Evidence[] = []
  for (const hit of labelHits) {
    const full = path.join(ROOT, hit.file)
    try {
      const content = await fs.readFile(full, 'utf-8')
      const idx = content.split(/\r?\n/).slice(Math.max(0, hit.line - 10), hit.line + 10).join('\n')
      if (!/lastUpdated/i.test(idx)) {
        suspicious.push(hit)
      }
    } catch {}
  }

  if (labelHits.length === 0 && correctUsage) {
    return { status: 'achieved', evidence: [] }
  }
  if (correctUsage && suspicious.length === 0) {
    return { status: 'achieved', evidence: labelHits }
  }
  if (correctUsage && suspicious.length > 0) {
    return { status: 'warning', evidence: suspicious, notes: 'Mixed usage detected' }
  }
  return { status: 'not_achieved', evidence: suspicious.length ? suspicious : labelHits }
}

async function scannerSmartInsightsFallback(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const enhancedPath = path.join(APP_DIR, 'components', 'EnhancedGeoGrid.tsx')
  try {
    const content = await fs.readFile(enhancedPath, 'utf-8')
    const hasLow = /Low current search activity\./.test(content)
    const hasEstimated = /Estimated\s+\{?[^\n}]+\}?\s+monthly searches\./.test(content)
    const hasBadCopy = /major market/i.test(content)
    const evidence: Evidence[] = []
    if (hasBadCopy) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Found legacy phrase: "major market"' })
      return { status: 'not_achieved', evidence }
    }
    if (hasLow && hasEstimated) {
      return { status: 'achieved', evidence }
    }
    evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Fallback copy conditions missing' })
    return { status: 'not_achieved', evidence }
  } catch (e) {
    return { status: 'not_achieved', evidence: [{ file: path.relative(ROOT, enhancedPath), line: 0, snippet: 'EnhancedGeoGrid.tsx not found' }] }
  }
}

export async function GET() {
  try {
    const [goals, enc, legend, quick, insights] = await Promise.all([
      readGoals(),
      scannerEncoding(),
      scannerLegendConsistency(),
      scannerQuickStatsTimestamp(),
      scannerSmartInsightsFallback()
    ])

    const now = new Date().toISOString()

    // Build defaults for all known scanners so new goals appear automatically
    const scannerDefaults: Record<string, { title: string; description: string; category: string; guidance: string; status: string; evidence: Evidence[]; notes?: string; clashDescription?: string }> = {
      'encoding-clean': {
        title: 'No encoding/emoji corruption',
        description: 'No replacement characters appear in UI (�). Emoji/icons render correctly.',
        category: 'quality',
        guidance: 'Replace corrupted characters and ensure files are UTF-8 encoded.',
        status: enc.status,
        evidence: enc.evidence,
        clashDescription: enc.evidence.length ? 'Replacement characters found in source files' : 'No corrupted characters detected'
      },
      'legend-consistency': {
        title: 'Performance Legend ranges are unified',
        description: 'Legend, labels, and colors use the same ranges: 1–5 Excellent, 6–10 Very Good, 11–15 Good, 16–25 Fair, 25+ Needs Work.',
        category: 'ui-consistency',
        guidance: 'Ensure all map legends and labels reflect the canonical ranges and wording across components.',
        status: legend.status,
        evidence: legend.evidence,
        clashDescription: legend.evidence.length ? 'Inconsistent legend ranges found' : 'All legend ranges appear consistent'
      },
      'quick-stats-timestamp': {
        title: 'Quick Stats shows data timestamp',
        description: "Quick Stats 'Last Update' uses ranking status timestamp, not local refresh time.",
        category: 'data-accuracy',
        guidance: 'Use rankStatus.lastUpdated when rendering the timestamp.',
        status: quick.status,
        evidence: quick.evidence,
        clashDescription: quick.notes || (quick.status === 'achieved' ? 'Quick Stats uses ranking timestamp' : 'Some Last Update labels are not tied to ranking timestamp')
      },
      'smart-insights-fallback': {
        title: 'Smart Insights fallback copy is accurate',
        description: 'When volume is 0 or unknown, copy indicates low activity; otherwise shows estimated searches.',
        category: 'copy',
        guidance: "If volume ≤ 0: 'Low current search activity.' Else: 'Estimated X monthly searches.'",
        status: insights.status,
        evidence: insights.evidence,
        clashDescription: insights.status === 'achieved' ? 'Fallback copy matches rules' : 'Fallback copy rules need attention'
      }
    }

    const goalMap = new Map<string, any>()
    for (const g of goals) goalMap.set(g.id, g)

    // Start with JSON-defined goals, attach statuses if a scanner exists
    const result: any[] = []
    for (const g of goals) {
      const def = scannerDefaults[g.id]
      if (def) {
        result.push({ ...g, status: def.status, evidence: def.evidence, lastChecked: now, clashDescription: def.clashDescription })
      } else {
        result.push({ ...g, status: 'warning', evidence: [], lastChecked: now, clashDescription: 'No scanner implemented for this goal yet' })
      }
    }

    // Append any scanner-backed goals missing from JSON so new features always appear
    for (const [id, def] of Object.entries(scannerDefaults)) {
      if (!goalMap.has(id)) {
        result.push({ id, title: def.title, description: def.description, category: def.category, guidance: def.guidance, status: def.status, evidence: def.evidence, lastChecked: now, clashDescription: def.clashDescription })
      }
    }

    return NextResponse.json({ goals: result })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to scan feature goals' }, { status: 500 })
  }
}
