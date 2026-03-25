// Simplified Kenya administrative data for MVP
export const counties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Muranga', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];

// MVP: user types constituency and ward as text
export const documentTypes = [
  { value: 'student_id', label: 'Student ID', required: false },
  { value: 'birth_certificate', label: 'Birth Certificate', required: true },
  { value: 'parent_id', label: 'Parent ID', required: true },
  { value: 'admission_letter', label: 'Admission Letter', required: true },
  { value: 'school_id', label: 'School ID', required: false },
  { value: 'fee_structure', label: 'Fee Structure', required: true },
  { value: 'fee_statement', label: 'Fee Statement', required: true },
  { value: 'vulnerability_proof', label: 'Vulnerability Proof (Optional)', required: false },
  { value: 'residency_proof', label: 'Residency Proof', required: true },
];

export const requiredDocumentTypes = documentTypes.filter(d => d.required).map(d => d.value);
