"use client"

import React from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css" 

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, disabled }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  }

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "align",
    "font",
    "size",
    "script",
    "direction",
  ]

  return (
    <div className={`relative ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        className={`
          // Overall container styling to match input fields
          border border-gray-300 rounded-md
          focus-within:ring-2 focus-within:ring-green-500 focus-within:outline-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
          // Override Quill's default styles
          [&_.ql-toolbar]:border-b-gray-300 [&_.ql-toolbar]:rounded-t-md [&_.ql-toolbar]:bg-gray-50
          [&_.ql-container]:border-t-0 [&_.ql-container]:rounded-b-md
          [&_.ql-editor]:bg-white [&_.ql-editor]:min-h-[120px] // White background for typing area, min height
          [&_.ql-editor.ql-blank::before]:text-gray-400 // Placeholder color
          [&_.ql-editor]:p-3 // Padding for typing area
          [&_.ql-snow.ql-toolbar_button]:hover:bg-gray-200 // Hover for toolbar buttons
          [&_.ql-snow.ql-toolbar_button.ql-active]:bg-green-100 // Active state for toolbar buttons
          [&_.ql-snow.ql-picker-label]:hover:bg-gray-200 // Hover for dropdown labels
          [&_.ql-snow.ql-picker-label.ql-active]:bg-green-100 // Active state for dropdown labels
          [&_.ql-snow.ql-picker.ql-expanded_.ql-picker-options]:border-gray-300 // Dropdown options border
          [&_.ql-snow.ql-picker.ql-expanded_.ql-picker-options]:bg-white // Dropdown options background
        `}
      />
    </div>
  )
}

export default RichTextEditor
