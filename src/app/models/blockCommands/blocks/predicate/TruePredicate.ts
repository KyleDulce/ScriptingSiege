import { Predicate } from '../../block-command';

/**
 * Predicate representing a true condition
 * the condition will always be true
 * See block-command.ts for specific documentation
 * on properties and methods
 */
export class TruePredicate implements Predicate {

  static id: string = btoa(TruePredicate.name);
  static label: string = 'true';
  static asCode = 'true';
  indentationLevel: number;
  negate: boolean = false;
  conjunction: string = '';

  evaluation(grid, unit): boolean {
    return true;
  }

  getId() {
    return TruePredicate.id;
  }

  getLabel() {
    return TruePredicate.label;
  }

  getAsCode(): string {
    return TruePredicate.asCode;
  }

}
