import { ConditionalBlock, Predicate } from '../../block-command';
import { EndIf } from '../terminal/Endif';
import { EmptyPredicate } from '../predicate/EmptyPredicate';
import { EndElse } from '../terminal/EndElse';
import { EndElseIf } from '../terminal/EndElseIf';

/**
 * ConditionalBlock representing an If statement
 * See block-command.ts for specific documentation
 * on properties and methods
 */
export class If implements ConditionalBlock {

  static label: string = 'If';
  static id: string = btoa(If.name);

  conditions: Array<Predicate> = [new EmptyPredicate()];
  terminal_blocks: Array<string> = [EndIf.label, EndElse.label, EndElseIf.label];
  indentationLevel: number;
  condition: Predicate = new EmptyPredicate();

  static asCode(conditions: Array<Predicate>){

    let code = 'if(';
    for(let condition of conditions){
      if(condition.conjunction !== ''){
        code += ` ${condition.conjunction + condition.conjunction} `;
      }
      if(condition.negate){
        code += '!'
      }
      code += condition.getAsCode();
    }
    code += '){';
    return code;

  };

  getId(): string {
    return If.id;
  }

  getLabel() {
    return If.label;
  }

  getAsCode(): string {
    return If.asCode(this.conditions);
  }

}
