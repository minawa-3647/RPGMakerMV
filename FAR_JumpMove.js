//=============================================================================
// FAR_JumpMove.js
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
 * @plugindesc キャラクターをジャンプ移動させるプラグインです。
 * @author 水沫(みなわ)
 * 
 * @param ControlSwitchNo
 * @desc 機能制御用スイッチ番号
 * @type switch
 * @default 0
 * 
 * @param PlayerJumpOn
 * @desc プレイヤーもジャンプ移動を行うか否かの制御
 * @type boolean
 * @default false
 * 
 * @help プラグインコマンドはありません。
 * 
 * ControlSwitchNo に指定したスイッチが ON のとき、以下の機能が有効になります。
 * ・メモ欄に<JumpMove>と指定されたイベントが、ジャンプ移動するようになります。
 * ・PlayerJumpOn が ON のとき、プレイヤーもジャンプ移動するようになります。
 * 　⇒フォロワーがいるとジャンプの仕様で全員先頭に集結するため不格好。一人旅向け。
 * 
 * 利用規約：
 * このプラグインはMITライセンスです。
 * 作者に無断で改変、再配布、商用利用、18禁製品利用など無問題です。
 * ただし、プラグイン本体の著作権表示と本許諾表示は残しておいてください。
 * また、本プラグインを使って何か問題が起きても、作者は一切関知しません。
 */

(function(){
    'use strict';

    var pName = "FAR_JumpMove";
    var parameters = PluginManager.parameters(pName);

    //@paramの型再設定用関数（ツクールの仕様でparameters通した時点でstring型になっている）
    var getParamNumber = function(param) { return Number(param) || 0; }
    var getParamBoolean = function(param) { return param.toLowerCase() === 'true'; }
    var getParamArray = function(param){ return !Object.keys(param).length ? [] : JSON.parse(param); }

    //パラメータを変数に設定
    var cSwitchNo = getParamNumber(parameters['ControlSwitchNo']);
    var pJumpOn = getParamBoolean(parameters['PlayerJumpOn']);

    //=============================================================================
    // Game_CharacterBase
    //  コアスクリプトの既定処理後にジャンプ処理付け足し
    //=============================================================================
    var _Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
    Game_CharacterBase.prototype.moveStraight = function(d) {
        var result = _Game_CharacterBase_moveStraight.call(this, d);

        if ($gameSwitches.value(cSwitchNo)){
            //メモ欄に<JumpMove>が存在するイベントは追加処理を行う
            if (this.constructor.name == 'Game_Event' && $gameMap.event(this._eventId).event().meta['JumpMove']){
                this.jump(0, 0);
            }
            //プレイヤーで、かつプレイヤーのジャンプ制御がONのとき
            else if(this.constructor.name == 'Game_Player' && pJumpOn){
                this.jump(0, 0);
            }
       }
        return result;
    };

})();