/*
 * Public API Surface of xt-workflow plugin
 *
 * Provides workflow UI implementations:
 * - registerWorkflowPlugin: Registration function for the plugin system
 * - ListDetailsComponent: Tabbed list/detail workflow implementation
 * - CarouselComponent: Carousel-based workflow implementation (not exported, used internally)
 */

export * from './lib/register';
export * from './lib/list-details/list-details.component';
