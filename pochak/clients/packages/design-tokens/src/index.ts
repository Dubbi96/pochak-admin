import tokens from "../tokens.json";

export type DesignTokens = typeof tokens;
export type Colors = typeof tokens.colors;
export type AppColors = typeof tokens.colors.app;
export type BoColors = typeof tokens.colors.bo;
export type BaseColors = typeof tokens.colors.base;
export type Typography = typeof tokens.typography;
export type Spacing = typeof tokens.spacing;
export type BorderRadius = typeof tokens.borderRadius;

export { tokens };
export default tokens;
