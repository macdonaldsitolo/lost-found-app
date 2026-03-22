// ── itemHelpers.js ────────────────────────────────────────────────────────
// Single source of truth for item display helpers.
// Import from any component that needs to display item names/labels.

export function getExtra(item) {
  try {
    return typeof item.extraFields === "string"
      ? JSON.parse(item.extraFields)
      : item.extraFields || {}
  } catch { return {} }
}

export function getItemName(item) {
  const extra = getExtra(item)
  const cat   = item.category?.toLowerCase()

  if (cat === "person") {
    if (extra.personName && extra.age) return `${extra.personName}, ${extra.age}`
    if (extra.personName) return extra.personName
  }

  if (cat === "phone") {
    // new field: phoneName; fallback to old brand+model for existing data
    if (extra.phoneName)                       return extra.phoneName
    if (extra.phoneName && extra.model)        return `${extra.phoneName} ${extra.model}`
    if (extra.brand && extra.model)            return `${extra.brand} ${extra.model}`
    if (extra.brand)                           return extra.brand
    if (extra.model)                           return extra.model
  }

  if (cat === "laptop") {
    // new field: laptopName; fallback to old brand+model for existing data
    if (extra.laptopName)                      return extra.laptopName
    if (extra.brand && extra.model)            return `${extra.brand} ${extra.model}`
    if (extra.brand)                           return extra.brand
    if (extra.model)                           return extra.model
  }

  if (cat === "wallet") {
    if (extra.brand && extra.color)            return `${extra.brand} (${extra.color})`
    if (extra.brand)                           return extra.brand
    if (extra.color)                           return extra.color
  }

  if (cat === "id card") {
    // new field: idType; fallback to old type field for existing data
    if (extra.idType)                          return extra.idType
    if (extra.type)                            return extra.type
  }

  if (cat === "other") {
    if (extra.itemName)                        return extra.itemName
  }

  return item.category || "Item"
}

export function getTypeLabel(item) {
  const map = { lost: "Lost", found: "Found", missing: "Missing", wanted: "Wanted" }
  return map[item.type] || "Item"
}

export function getLocationLabel(item) {
  const extra = getExtra(item)
  if (item.type === "lost" || item.type === "missing")
    return `Last seen in ${item.location}`
  if (item.type === "found")
    return `Found at ${item.location}`
  if (item.type === "wanted")
    return extra.homeDistrict ? `From ${extra.homeDistrict}` : "Wanted person"
  return item.location || ""
}

export function formatDate(d) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  })
}
