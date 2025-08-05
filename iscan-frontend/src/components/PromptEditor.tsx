'use client'

import React, { useState, useEffect } from 'react'

interface PromptEditorProps {
  value: any
  onChange: (value: any) => void
  className?: string
}

const DEFAULT_PROMPTS = {
  invoice: {
    system_prompt: "You are a document processing assistant specializing in invoice data extraction. Extract information accurately and return it in JSON format.",
    extraction_prompt: "Extract the following information from this invoice:\n- invoice_number\n- date\n- vendor_name\n- total_amount\n- line_items (array of {description, quantity, unit_price, total})\n\nReturn the data as valid JSON.",
    required_fields: ["invoice_number", "vendor_name", "total_amount"]
  },
  contract: {
    system_prompt: "You are a document processing assistant specializing in contract analysis. Extract key contract information and return it in JSON format.",
    extraction_prompt: "Extract the following information from this contract:\n- contract_title\n- parties (array of party names)\n- effective_date\n- expiration_date\n- contract_value\n- key_terms (array of important terms)\n\nReturn the data as valid JSON.",
    required_fields: ["contract_title", "parties", "effective_date"]
  },
  receipt: {
    system_prompt: "You are a document processing assistant specializing in receipt data extraction. Extract purchase information accurately and return it in JSON format.",
    extraction_prompt: "Extract the following information from this receipt:\n- merchant_name\n- transaction_date\n- total_amount\n- items (array of {name, price, quantity})\n- payment_method\n\nReturn the data as valid JSON.",
    required_fields: ["merchant_name", "transaction_date", "total_amount"]
  }
}

export default function PromptEditor({ value, onChange, className = '' }: PromptEditorProps) {
  const [jsonText, setJsonText] = useState('')
  const [isValidJson, setIsValidJson] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    try {
      setJsonText(JSON.stringify(value || {}, null, 2))
      setIsValidJson(true)
    } catch (error) {
      setJsonText('')
      setIsValidJson(false)
    }
  }, [value])

  const handleTextChange = (text: string) => {
    setJsonText(text)
    
    try {
      const parsed = JSON.parse(text)
      setIsValidJson(true)
      onChange(parsed)
    } catch (error) {
      setIsValidJson(false)
    }
  }

  const handleTemplateSelect = (template: any) => {
    const formattedTemplate = JSON.stringify(template, null, 2)
    setJsonText(formattedTemplate)
    onChange(template)
    setShowTemplates(false)
  }

  const validatePromptStructure = (prompts: any) => {
    const warnings = []
    
    if (!prompts.system_prompt) {
      warnings.push('Missing system_prompt')
    }
    if (!prompts.extraction_prompt) {
      warnings.push('Missing extraction_prompt')
    }
    if (!prompts.required_fields || !Array.isArray(prompts.required_fields)) {
      warnings.push('Missing or invalid required_fields array')
    }
    
    return warnings
  }

  const currentValue = isValidJson ? JSON.parse(jsonText || '{}') : {}
  const warnings = isValidJson ? validatePromptStructure(currentValue) : []

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Processing Prompts
        </label>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Use Template
        </button>
      </div>

      {showTemplates && (
        <div className="border rounded-md p-4 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Choose a template to start with:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {Object.entries(DEFAULT_PROMPTS).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-3 border rounded-md hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="font-medium text-sm capitalize">{key}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {template.system_prompt.substring(0, 60)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <textarea
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={20}
          className={`
            block w-full font-mono text-sm border rounded-md shadow-sm p-3
            ${isValidJson 
              ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
              : 'border-red-300 focus:ring-red-500 focus:border-red-500'
            }
          `}
          placeholder='{\n  "system_prompt": "Your system prompt here...",\n  "extraction_prompt": "Your extraction prompt here...",\n  "required_fields": ["field1", "field2"]\n}'
        />
        
        {!isValidJson && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
              Invalid JSON
            </span>
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 font-medium mb-1">Validation Warnings:</p>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>Expected structure:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><code>system_prompt</code>: Instructions for the AI assistant</li>
          <li><code>extraction_prompt</code>: Specific extraction instructions</li>
          <li><code>required_fields</code>: Array of mandatory fields to extract</li>
        </ul>
      </div>
    </div>
  )
}