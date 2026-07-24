import type { ThemeColors } from '../../../../src/theme/mobile-theme'
import { createMobileSessionCommandInputStyles } from './mobile-session-command-input-styles'
import { createMobileSessionFrameStyles } from './mobile-session-frame-styles'
import { createMobileSessionReaderStyles } from './mobile-session-reader-styles'
import { createMobileSessionReviewCommentStyles } from './mobile-session-review-comment-styles'

// Merges the four session style factories. Consumers call useThemedStyles(createMobileSessionStyles).
export const createMobileSessionStyles = (colors: ThemeColors) => ({
  ...createMobileSessionFrameStyles(colors),
  ...createMobileSessionReaderStyles(colors),
  ...createMobileSessionReviewCommentStyles(colors),
  ...createMobileSessionCommandInputStyles(colors)
})
