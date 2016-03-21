export function translate (translations, text) {
  return translations && translations[text] || text
}
