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
    const hits = await searchInFile(f, /\ufffd/)
    evidence.push(...hits)
  }
  return { status: evidence.length === 0 ? 'achieved' : 'not_achieved', evidence }
}

async function scannerLegendConsistency(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const files = await walk(path.join(APP_DIR, 'components'))
  const badPatterns = [
    /(?<!Very\s)Good\s*\(6\s*[-–]\s*15\)/i,
    /(?<!Very\s)Good\s*\(6\s*[-–]\s*10\)/i,
    /\bTop\s*10\)/i
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

async function scannerInsightsAreaTrackedOnly(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const enhancedPath = path.join(APP_DIR, 'components', 'EnhancedGeoGrid.tsx')
  try {
    const content = await fs.readFile(enhancedPath, 'utf-8')
    const evidence: Evidence[] = []
    const hasInsightsLabel = content.includes('📍 Insights Area:')
    const hasOptionsFromLocations = /\{currentLocations\.map\(l\s*=>\s*\(/.test(content)
    const hasValueBinding = /setSelectedAreaName\(e\.target\.value/.test(content)
    const usesAreaForCompetitors = /getAreaCompetitors\(areaName\)/.test(content)
    const hasDefaultSetter = /if \(!selectedAreaName && locs\.length\)\s*\{[\s\S]*setSelectedAreaName\(/.test(content)
    const hasFallbackDefault = /const\s+areaName\s*=\s*selectedAreaName\s*\|\|\s*currentLocations\[0\]\?\.name/.test(content)
    const usesServiceAreasForSelect = /serviceAreas\.length\s*\?\s*serviceAreas\.map\(.*?\)\s*:\s*currentLocations\.map\(/s.test(content)

    if (!hasInsightsLabel) {
      const line = content.split(/\r?\n/).findIndex(l => l.includes('Insights Area')) + 1
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: Math.max(1, line), snippet: 'Missing Insights Area control label' })
    }
    if (!usesServiceAreasForSelect) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Insights Area options must be limited to Tracked Areas (serviceAreas) with fallback to currentLocations' })
    }
    if (!hasValueBinding) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Insights Area select not wired to selectedAreaName setter' })
    }
    if (!usesAreaForCompetitors) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Competitor list not derived via getAreaCompetitors(areaName)' })
    }
    if (!hasDefaultSetter && !hasFallbackDefault) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'No default Insights Area selection on load' })
    }

    const status = evidence.length === 0 ? 'achieved' : (evidence.length <= 2 ? 'warning' : 'not_achieved')
    return { status, evidence }
  } catch {
    return { status: 'not_achieved', evidence: [{ file: path.relative(ROOT, enhancedPath), line: 0, snippet: 'EnhancedGeoGrid.tsx not found' }] }
  }
}

async function scannerUSCoverageAndNoData(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const enhancedPath = path.join(APP_DIR, 'components', 'EnhancedGeoGrid.tsx')
  const geoPath = path.join(APP_DIR, 'lib', 'geo.ts')
  try {
    const [enhanced, geo] = await Promise.all([
      fs.readFile(enhancedPath, 'utf-8'),
      fs.readFile(geoPath, 'utf-8').catch(() => '')
    ])
    const evidence: Evidence[] = []
    // Check no-data indicator rendered
    if (!/No live data yet/i.test(enhanced)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Missing "No live data yet" tooltip/indicator for empty areas' })
    }
    // Check that serviceAreas missing entries are handled
    if (!/serviceAreas\n\s*\.filter\(/.test(enhanced)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'No placeholders for tracked areas without data' })
    }
    // Basic coverage check: common cities should be in geo or resolvable
    const samples = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Miami, FL']
    for (const s of samples) {
      const key = s.toLowerCase().replace(/\s+/g,' ')
      if (!new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(geo.toLowerCase())) {
        evidence.push({ file: path.relative(ROOT, geoPath), line: 1, snippet: `Missing coords for sample city: ${s}` })
      }
    }
    const status = evidence.length === 0 ? 'achieved' : (evidence.length <= 2 ? 'warning' : 'not_achieved')
    return { status, evidence }
  } catch (e) {
    return { status: 'not_achieved', evidence: [{ file: path.relative(ROOT, enhancedPath), line: 0, snippet: 'Files not accessible' }] }
  }
}

async function scannerCompetitorLegendAlignment(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const enhancedPath = path.join(APP_DIR, 'components', 'EnhancedGeoGrid.tsx')
  try {
    const content = await fs.readFile(enhancedPath, 'utf-8')
    const evidence: Evidence[] = []
    // Check that competitor legend shows context of selectedKeyword
    if (!/Based on:\s*\{selectedKeyword === 'all' \? 'overall' : selectedKeyword\}/.test(content) && !/legend-context/.test(content)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Competitor legend lacks context label (Based on: …)' })
    }
    // Check that competitor list is derived from tracked details for selected area
    if (!/getAreaCompetitors\(/.test(content)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Competitor legend not using getAreaCompetitors(areaName)' })
    }
    // Check that selectedKeyword influences competitor scoring
    if (!/selectedKeyword/.test(content)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'selectedKeyword not referenced in competitor computations' })
    }
    // Check that competitors are sorted by best rank when shown
    if (!/sort\(\(a: any, b: any\) => a\.location\.score - b\.location\.score\)/.test(content)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Competitors not sorted by rank in legend' })
    }

    const status = evidence.length === 0 ? 'achieved' : (evidence.length <= 2 ? 'warning' : 'not_achieved')
    return { status, evidence }
  } catch (e) {
    return { status: 'not_achieved', evidence: [{ file: path.relative(ROOT, enhancedPath), line: 0, snippet: 'EnhancedGeoGrid.tsx not found' }] }
  }
}

async function scannerSmartInsightsTrackedAreasOnly(): Promise<{ status: string; evidence: Evidence[]; notes?: string }>{
  const enhancedPath = path.join(APP_DIR, 'components', 'EnhancedGeoGrid.tsx')
  try {
    const content = await fs.readFile(enhancedPath, 'utf-8')
    const evidence: Evidence[] = []

    // Ensure insights fetch is scoped to tracked area name
    const hasAreaConst = /const\s+areaName\s*=\s*selectedAreaName\s*\|\|\s*currentLocations\[0\]\?\.name/.test(content)
    const hasInsightsFetch = /apiFetch<[^>]*>\(`\/insights\/smart\?area=\$\{encodeURIComponent\(areaName\)\}`\)/.test(content)
    if (!hasAreaConst || !hasInsightsFetch) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Smart Insights fetch must use area = selectedAreaName || currentLocations[0]?.name' })
    }

    // Ensure the three cards exist
    if (!/<h4>Best Opportunity<\/h4>/.test(content)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Missing Best Opportunity card' })
    }
    if (!/<h4>Needs Attention<\/h4>/.test(content)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Missing Needs Attention card' })
    }
    if (!/<h4>Success Story<\/h4>/.test(content)) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Missing Success Story card' })
    }

    // Ensure rich details (positions, leader, potential clicks, volume) are referenced
    const hasOppDetails = /opportunities\?\.?\[0\]/.test(content) && /potentialClicks/.test(content) && /leaderPosition/.test(content) && /ourPosition/.test(content)
    if (!hasOppDetails) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Best Opportunity should reference ourPosition, leaderPosition, and potentialClicks from smartInsights' })
    }
    const hasThreatDetails = /threats\?\.?\[0\]/.test(content) && /volume/.test(content) && /leaderPosition/.test(content) && /ourPosition/.test(content)
    if (!hasThreatDetails) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Needs Attention should reference ourPosition, leaderPosition, and volume from smartInsights' })
    }
    const hasWinDetails = /quickWins\?\.?\[0\]/.test(content) && /ourPosition/.test(content) && /leaderPosition/.test(content)
    if (!hasWinDetails) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Success Story should reference ourPosition and leaderPosition from smartInsights' })
    }

    // Ensure the rendering uses an area derived from tracked selections/locations inside cards
    const hasCardAreaRef = /const\s+areaName\s*=\s*selectedLocation\s*\?\s*currentLocations\.find\(l\s*=>\s*l\.id === selectedLocation\)\?\.name\s*:\s*currentLocations\[0\]\?\.name/.test(content)
    if (!hasCardAreaRef) {
      evidence.push({ file: path.relative(ROOT, enhancedPath), line: 1, snippet: 'Cards should reference areaName derived from currentLocations/selectedLocation' })
    }

    const status = evidence.length === 0 ? 'achieved' : (evidence.length <= 2 ? 'warning' : 'not_achieved')
    return { status, evidence }
  } catch {
    return { status: 'not_achieved', evidence: [{ file: path.relative(ROOT, enhancedPath), line: 0, snippet: 'EnhancedGeoGrid.tsx not found' }] }
  }
}

export async function GET() {
  try {
    const [goals, enc, legend, quick, insights, areaTracked, compAlign, usCoverage, insightsTracked] = await Promise.all([
      readGoals(),
      scannerEncoding(),
      scannerLegendConsistency(),
      scannerQuickStatsTimestamp(),
      scannerSmartInsightsFallback(),
      scannerInsightsAreaTrackedOnly(),
      scannerCompetitorLegendAlignment(),
      scannerUSCoverageAndNoData(),
      scannerSmartInsightsTrackedAreasOnly()
    ])

    const now = new Date().toISOString()

    // Build defaults for all known scanners so new goals appear automatically
    const scannerDefaults: Record<string, { title: string; description: string; category: string; guidance: string; status: string; evidence: Evidence[]; notes?: string; clashDescription?: string }> = {
      'encoding-clean': {
        title: 'No encoding/emoji corruption',
        description: 'No replacement characters appear in UI. Emoji/icons render correctly.',
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
      },
      'competitor-legend-alignment': {
        title: 'Competitors legend aligned to tracked details',
        description: 'Competitors legend shows context (keyword/overall), uses selected area details, and ranks from tracked positions.',
        category: 'ui-consistency',
        guidance: 'Display a context label (Based on: …), use getAreaCompetitors(areaName), apply selectedKeyword, and sort by rank.',
        status: compAlign.status,
        evidence: compAlign.evidence,
        clashDescription: compAlign.evidence.length ? 'Competitor legend missing context or alignment to tracked data' : 'Competitor legend reflects tracked keyword and area details'
      },
      'us-coverage-and-no-data-indicator': {
        title: 'US coverage and no-data indicator',
        description: 'All US cities/states can be added for tracking. If a city has no live data, the map shows a clear “No live data yet” indicator at its location.',
        category: 'data-accuracy',
        guidance: 'Support adding any "City, ST" and render a gray placeholder bubble with “No live data yet” when ranks are unavailable.',
        status: usCoverage.status,
        evidence: usCoverage.evidence,
        clashDescription: usCoverage.evidence.length ? 'Coverage gaps or missing no-data indicator detected' : 'Coverage and no-data indicators verified'
      },
      'insights-area-tracked-only': {
        title: 'Insights Area limited to tracked areas',
        description: 'Insights Area dropdown only lists areas present on the map (currentLocations) and used for competitor comparisons.',
        category: 'ui-consistency',
        guidance: 'Populate options from currentLocations.map(...), bind to selectedAreaName, and feed getAreaCompetitors(areaName).',
        status: areaTracked.status,
        evidence: areaTracked.evidence,
        clashDescription: areaTracked.evidence.length ? 'Insights Area not fully constrained to tracked map/competitor areas' : 'Insights Area is constrained to tracked areas and used consistently'
      },
      'smart-insights-tracked-areas-only': {
        title: 'Smart Insights derived only from tracked areas',
        description: 'Smart Insights (Best Opportunity, Needs Attention, Success Story) are generated using data exclusively from tracked areas.',
        category: 'data-accuracy',
        guidance: 'Fetch insights with area = selectedAreaName or currentLocations[0].name; render detail from smartInsights/opportunities/threats/quickWins; avoid untracked area references.',
        status: insightsTracked.status,
        evidence: insightsTracked.evidence,
        clashDescription: insightsTracked.evidence.length ? 'Smart Insights not clearly tied to tracked areas or missing rich details' : 'Smart Insights scoped to tracked areas with rich details'
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
