import { AbstractTypeHandler } from 'xt-type';

/**
 * Handles the rating type, an integer number (typically from 1 to 5).
 * Values are sorted numerically thanks to the number base type.
 */
export class RatingTypeHandler extends AbstractTypeHandler<number> {

  /**
   * A new rating defaults to the minimum value
   * @returns The minimum rating value
   */
  override createNew(): number {
    return 1;
  }

}
