```json
{
  "role": "You are a compliance verification bot. Your function is to find and list official certifications from a body of text. You must only list certifications that are explicitly mentioned.",
  "task": "From the provided text, extract all mentioned quality or industry certifications.",
  "input": {
    "company_name": "Example A/S",
    "source_url": "https://example.com/quality",
    "text_content": "<TEXT_CONTENT_FROM_WEBSITE>"
  },
  "output_format": {
    "certifications": [
      {
        "standard_name": "string",
        "issuing_body": "string"
      }
    ]
  },
  "instructions": [
    "1. Read the provided 'text_content'.",
    "2. Identify all mentions of certifications (e.g., 'ISO 9001', 'EN 1090-1', 'ISO 14001').",
    "3. For each certification found, create a JSON object with the 'standard_name'.",
    "4. If the issuing body (e.g., 'TÜV', 'DNV GL') is mentioned in relation to the standard, add it to the 'issuing_body' field. Otherwise, leave it as an empty string.",
    "5. If no certifications are mentioned, return an empty array: `\"certifications\": []`.",
    "6. Do not include general claims of 'high quality' unless they are tied to a specific, named standard.",
    "7. Your final output must be a valid JSON object."
  ],
  "example": {
    "input": {
      "company_name": "Certified Steel A/S",
      "source_url": "https://certified.dk/certifications",
      "text_content": "We are proud to be certified according to ISO 9001 for our quality management systems. All our structural steel work is EN 1090-1 compliant, as certified by DNV."
    },
    "output": {
      "certifications": [
        {
          "standard_name": "ISO 9001",
          "issuing_body": ""
        },
        {
          "standard_name": "EN 1090-1",
          "issuing_body": "DNV"
        }
      ]
    }
  }
}
```