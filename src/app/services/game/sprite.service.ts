import { Injectable } from '@angular/core';
import * as createjs from "createjs-module";
import {Unit} from '../../models/game/units/Unit';
import {SpriteConstants} from '../SpriteConstants';
(<any>window).createjs = createjs;

@Injectable({
  providedIn: 'root'
})
export class SpriteService {

  constructor() {}

  static loadSpriteSheets(){
    let manifest = [
      {id:SpriteConstants.archer, src: 'assets/animations/archer sprite sheet.png'},
      {id:SpriteConstants.swordsmen, src: 'assets/animations/swordsman sprite sheet.png'},
      {id:SpriteConstants.tower, src:'assets/animations/tower sprite sheet.png'},
      {id:SpriteConstants.testMap, src:'assets/maps/test map.png'}
    ];
    let queue = new createjs.LoadQueue();
    queue.loadManifest(manifest);
    return queue;

  }

  initSpritesForAll(units: Array<Unit>, imageQueue){

    for(let unit of units){

      if(unit === null){
        continue;
      }
      unit.initSprite(imageQueue.getResult(unit.constructor.name));

    }

  }

  flipSpriteInPlace(unit){

    unit.sprite.scaleX = -unit.sprite.scaleX;

  }


}
