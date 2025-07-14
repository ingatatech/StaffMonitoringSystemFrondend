// @ts-nocheck
"use client"

import React from "react"

const RichTextRenderer = ({ content, className = "" }) => {
  const cleanHtml = (html) => {
    if (!html) return ""
    
    // Remove cursor spans
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    
    // Preserve background colors by converting inline styles to classes
    cleaned = cleaned.replace(/style="[^"]*background-color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)[^"]*"/g, 
      (match, r, g, b) => {
        return `class="bg-custom-${r}-${g}-${b}"`
      })
    
    // Standardize paragraph styling
    cleaned = cleaned.replace(/<p>/g, '<p class="mb-3 leading-relaxed">')
    
    // Standardize list styling
    cleaned = cleaned.replace(
      /<ul>/g,
      '<ul class="mb-3 pl-6 list-disc">'
    )
    cleaned = cleaned.replace(
      /<ol>/g,
      '<ol class="mb-3 pl-6 list-decimal">'
    )
    cleaned = cleaned.replace(/<li>/g, '<li class="mb-1 leading-snug">')
    
    // Handle alignment classes
    cleaned = cleaned.replace(/class="ql-align-justify"/g, 'class="text-justify"')
    cleaned = cleaned.replace(/class="ql-align-center"/g, 'class="text-center"')
    cleaned = cleaned.replace(/class="ql-align-right"/g, 'class="text-right"')
    
    // Handle text colors
    cleaned = cleaned.replace(/style="[^"]*color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)[^"]*"/g, 
      (match, r, g, b) => {
        return `class="text-custom-${r}-${g}-${b}"`
      })
    
    return cleaned
  }

  // Generate dynamic CSS for background colors found in the content
  const generateDynamicStyles = (html) => {
    if (!html) return null
    
    const bgColorRegex = /class="bg-custom-(\d+)-(\d+)-(\d+)"/g
    const textColorRegex = /class="text-custom-(\d+)-(\d+)-(\d+)"/g
    const styles = []
    const seen = new Set()
    
    let match
    while ((match = bgColorRegex.exec(html)) !== null) {
      const key = `bg-${match[1]}-${match[2]}-${match[3]}`
      if (!seen.has(key)) {
        seen.add(key)
        styles.push(
          `.bg-custom-${match[1]}-${match[2]}-${match[3]} { background-color: rgb(${match[1]}, ${match[2]}, ${match[3]}) !important; }`
        )
      }
    }
    
    while ((match = textColorRegex.exec(html)) !== null) {
      const key = `text-${match[1]}-${match[2]}-${match[3]}`
      if (!seen.has(key)) {
        seen.add(key)
        styles.push(
          `.text-custom-${match[1]}-${match[2]}-${match[3]} { color: rgb(${match[1]}, ${match[2]}, ${match[3]}) !important; }`
        )
      }
    }
    
    if (styles.length === 0) return null
    
    return (
      <style jsx>{`
        ${styles.join('\n')}
      `}</style>
    )
  }

  const dynamicStyles = generateDynamicStyles(content)

  return (
    <div className={`rich-text-content ${className}`}>
      {dynamicStyles}
      <div
        dangerouslySetInnerHTML={{ __html: cleanHtml(content) }}
        className="prose max-w-none"
        style={{
          lineHeight: "1.6",
          color: "#1f2937",
          fontSize: "0.9rem",
        }}
      />
    </div>
  )
}

export default RichTextRenderer