//=============================================================================
// FAR_ConfusionMove.js
// ----------------------------------------------------------------------------
// Copyright (c) 2020 水沫(みなわ)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2020/06/02 初版
// ----------------------------------------------------------------------------
// [Contact]   : https://github.com/minawa-3647
//=============================================================================

/*:
 * @plugindesc プレイヤーを酔っ払い移動させるプラグインです。
 * @author 水沫(みなわ)
 * 
 * @param ControlSwitchNo
 * @desc 機能制御用スイッチ番号
 * @type switch
 * @default 0
 * 
 * @param PlayerBalloonNo
 * @desc プレイヤーの頭上に表示するバルーン番号
 * @type number
 * @default 0
 * 
 * @help プラグインコマンドはありません。
 * 
 * ControlSwitchNo に指定したスイッチが ON のとき、以下の機能が有効になります。
 * ・プレイヤーの移動方向がランダム（方向キーと連動しなくなる）になります。
 * ・PlayerBalloonNo に 0 以外の数値を入れると、該当番号のバルーンがプレイヤーの頭上に繰り返し表示されます。
 * 　⇒フォロワーがいても、バルーンが表示されるのはプレイヤーの頭上のみです。一人旅向け。
 * 
 * 利用規約：
 * このプラグインはMITライセンスです。
 * 作者に無断で改変、再配布、商用利用、18禁製品利用など無問題です。
 * ただし、プラグイン本体の著作権表示と本許諾表示は残しておいてください。
 * また、本プラグインを使って何か問題が起きても、作者は一切関知しません。
 */

(function(){
    'use strict';

    var pName = "FAR_ConfusionMove";
    var parameters = PluginManager.parameters(pName);

    //@paramの型再設定用関数（ツクールの仕様でparameters通した時点でstring型になっている）
    var getParamNumber = function(param) { return Number(param) || 0; }
    var getParamBoolean = function(param) { return param.toLowerCase() === 'true'; }
    var getParamArray = function(param){ return !Object.keys(param).length ? [] : JSON.parse(param); }

    //パラメータを変数に設定
    var cSwitchNo = getParamNumber(parameters['ControlSwitchNo']);
    var pBalloonNo = getParamNumber(parameters['PlayerBalloonNo']);

    //=============================================================================
    // Game_Player
    //  コアスクリプトの既定処理前に移動先の向きを書き換え
    //=============================================================================
    var _Game_Player_executeMove = Game_Player.prototype.executeMove;
    Game_Player.prototype.executeMove = function(direction) {

        if($gameSwitches.value(cSwitchNo)){
            var random = Math.floor( Math.random () * 4) + 1;//1~4
            direction = random * 2;//2,4,6,8 のいずれか
        }

        var result = _Game_Player_executeMove.call(this, direction);
        return result;
    };

    //=============================================================================
    // Game_Map
    //  コアスクリプトの既定処理後に、プレイヤーの頭上にバルーンをポップアップ
    //=============================================================================
    var _Game_Map_updateInterpreter = Game_Map.prototype.updateInterpreter;
    Game_Map.prototype.updateInterpreter = function() {
        var result = _Game_Map_updateInterpreter.call(this);

        if($gameSwitches.value(cSwitchNo)){
            if(!Game_Interpreter.prototype.character(-1)._balloonPlaying){
                Game_Interpreter.prototype.character(-1).requestBalloon(pBalloonNo);
            }
        }

        return result;
    };

})();