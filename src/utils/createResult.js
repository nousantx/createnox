var DEFAULT_ERROR_REASON = 'Unknown reason'
export const DEFAULT_LABEL = 'createnox'

export const createResult = ({
  className,
  rules,
  variant,
  raw,
  isImportant = false,
  use = DEFAULT_LABEL
}) => ({ use, className, rules, isImportant, variant, raw })

export const createErrorResult = ({
  className,
  use = DEFAULT_LABEL,
  reason = DEFAULT_ERROR_REASON
}) => ({ use, className, rules: null, reason })
