'use client'


import { useState } from 'react'
import { apiFetch } from '../services/api'

export default function ManualDataImport() {
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [csvData, setCsvData] = useState('')

  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      alert('Please paste your CSV data first')
      return
    }

    setImportStatus('uploading')
    
    try {
      const response = await apiFetch('/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData })
      })
      
      if (response.ok) {
        setImportStatus('success')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setImportStatus('error')
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportStatus('error')
    }
  }

  const downloadTemplate = () => {
    const template = `keyword,location,position,clicks,impressions
"solar installation austin","Austin",12,23,890
"austin solar company","Austin",15,18,720
"round rock solar","Round Rock",8,12,340
"cedar park solar","Cedar Park",6,15,280
"pflugerville solar","Pflugerville",3,8,180`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'astrawatt-ranking-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="manual-import-container">
      <div className="import-header">
        <h3>📊 Import Search Console Data Manually</h3>
        <p>While OAuth is being set up, import your Google Search Console data directly</p>
      </div>

      <div className="import-steps">
        <div className="step">
          <span className="step-number">1</span>
          <div className="step-content">
            <h4>Get Your Data from Google Search Console</h4>
            <ol>
              <li>Go to <a href="https://search.google.com/search-console" target="_blank">Google Search Console</a></li>
              <li>Select your astrawatt.com property</li>
              <li>Go to "Performance" → "Search results"</li>
              <li>Click "Queries" tab, then "Export" → "Download CSV"</li>
            </ol>
          </div>
        </div>

        <div className="step">
          <span className="step-number">2</span>
          <div className="step-content">
            <h4>Download Template (Optional)</h4>
            <button onClick={downloadTemplate} className="template-btn">
              📁 Download CSV Template
            </button>
            <p>Use this template format for your data</p>
          </div>
        </div>

        <div className="step">
          <span className="step-number">3</span>
          <div className="step-content">
            <h4>Paste Your CSV Data</h4>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here...&#10;Example:&#10;keyword,location,position,clicks,impressions&#10;solar installation austin,Austin,12,23,890"
              className="csv-input"
              rows={8}
            />
          </div>
        </div>

        <div className="step">
          <span className="step-number">4</span>
          <div className="step-content">
            <h4>Import to Database</h4>
            <button 
              onClick={handleCSVImport}
              disabled={importStatus === 'uploading' || !csvData.trim()}
              className={`import-btn ${importStatus}`}
            >
              {importStatus === 'uploading' && '⏳ Importing...'}
              {importStatus === 'success' && '✅ Import Successful!'}
              {importStatus === 'error' && '❌ Import Failed - Try Again'}
              {importStatus === 'idle' && '📊 Import Data to Database'}
            </button>
          </div>
        </div>
      </div>

      {importStatus === 'success' && (
        <div className="success-message">
          🎉 Data imported successfully! Your dashboard will refresh with real data in 2 seconds.
        </div>
      )}

      {importStatus === 'error' && (
        <div className="error-message">
          ❌ Import failed. Please check your CSV format and try again.
        </div>
      )}
    </div>
  )
}
