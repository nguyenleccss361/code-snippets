/**
 * Generates some demo clinical trial form tree data. The
 * hierarchy of node types is:
 *
 * Events (e.g. Screening) -> Forms (e.g. Demographics) ->
 * Field Groups (e.g. Race & Ethnicity) -> Fields
 * (e.g. Race, Ethnicity)
 */
export function buildClinicalTrialTree(count, depth) {
  if (depth < 0) {
    return []
  }

  let type;
  if (depth === 3) {
    type = 'event'
  } else if (depth === 2) {
    type = 'form'
  } else if (depth === 1) {
    type = 'field_group'
  } else if (depth === 0) {
    type = 'field'
  }

  return Array.from({ length: count }, (_, i) => ({
    id: `${type}_${Math.random().toString(36).substring(2, 10)}`,
    type,
    depth,
    children: buildClinicalTrialTree(count, depth - 1),
  }))
}
