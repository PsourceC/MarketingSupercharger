export type City = { city: string; state: string }

// Curated list of common US cities (extendable)
export const CITIES: City[] = [
  { city: 'Austin', state: 'TX' },
  { city: 'Round Rock', state: 'TX' },
  { city: 'Cedar Park', state: 'TX' },
  { city: 'Georgetown', state: 'TX' },
  { city: 'Pflugerville', state: 'TX' },
  { city: 'Leander', state: 'TX' },
  { city: 'Hutto', state: 'TX' },
  { city: 'San Marcos', state: 'TX' },
  { city: 'Kyle', state: 'TX' },
  { city: 'Buda', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Mesa', state: 'AZ' },
  { city: 'Chandler', state: 'AZ' },
  { city: 'Gilbert', state: 'AZ' },
  { city: 'Glendale', state: 'AZ' },
  { city: 'Scottsdale', state: 'AZ' },
  { city: 'Tempe', state: 'AZ' },
  { city: 'Peoria', state: 'AZ' },
  { city: 'Surprise', state: 'AZ' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'San Jose', state: 'CA' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Fresno', state: 'CA' },
  { city: 'Riverside', state: 'CA' },
  { city: 'Irvine', state: 'CA' },
  { city: 'Oakland', state: 'CA' },
  { city: 'Bakersfield', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'Houston', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'El Paso', state: 'TX' },
  { city: 'Arlington', state: 'TX' },
  { city: 'Plano', state: 'TX' },
  { city: 'Irving', state: 'TX' },
  { city: 'Frisco', state: 'TX' },
  { city: 'McKinney', state: 'TX' },
  { city: 'New York', state: 'NY' },
  { city: 'Buffalo', state: 'NY' },
  { city: 'Rochester', state: 'NY' },
  { city: 'Syracuse', state: 'NY' },
  { city: 'Albany', state: 'NY' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Naperville', state: 'IL' },
  { city: 'Aurora', state: 'IL' },
  { city: 'Joliet', state: 'IL' },
  { city: 'Springfield', state: 'IL' },
  { city: 'Miami', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'St. Petersburg', state: 'FL' },
  { city: 'Denver', state: 'CO' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Aurora', state: 'CO' },
  { city: 'Fort Collins', state: 'CO' },
  { city: 'Boulder', state: 'CO' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Tacoma', state: 'WA' },
  { city: 'Spokane', state: 'WA' },
  { city: 'Bellevue', state: 'WA' },
  { city: 'Kirkland', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Salem', state: 'OR' },
  { city: 'Eugene', state: 'OR' },
  { city: 'Gresham', state: 'OR' },
  { city: 'Hillsboro', state: 'OR' }
]

export function formatCity(c: City) {
  return `${c.city}, ${c.state}`
}

export function suggestCities(input: string, limit = 8): string[] {
  const q = input.trim().toLowerCase()
  if (!q) return []
  // Match "City, ST" or partials of city/state
  return CITIES.filter(c => {
    const full = `${c.city}, ${c.state}`.toLowerCase()
    return full.startsWith(q) || c.city.toLowerCase().startsWith(q) || q.split(/[,\s]+/).every(p => full.includes(p))
  })
  .slice(0, limit)
  .map(formatCity)
}
