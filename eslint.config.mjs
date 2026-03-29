// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // Custom rules: warn when `any` is used so it can be fixed progressively
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
)
