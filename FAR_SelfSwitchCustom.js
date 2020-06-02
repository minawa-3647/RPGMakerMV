//=============================================================================
// FAR_SelfSwitchCustom.js
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
 * @plugindesc セルフスイッチ変更時のマップリフレッシュを変更イベントのみにします。
 * @author 水沫(みなわ)
 * 
 * @param ApplyFlag
 * @desc 設定したスイッチ番号のtrue/falseで動的にプラグイン機能をON/OFF
 * @type switch
 * @default 0
 * 
 * @help プラグインコマンドはありません。
 * 
 * ApplyFlag に指定したスイッチが ON のとき、プラグイン機能が有効になります。
 * ・ApplyFlagにスイッチの指定を行わない(既定値0のまま)場合、機能無効です。
 * ・指定したスイッチをOFFにした場合も、機能無効（通常のセルフスイッチ変更時処理）です。
 * 　⇒用途：何らかの不具合が発生する際、直前で通常の処理に切り替えて回避する等。
 * 
 * 利用規約：
 * このプラグインはMITライセンスです。
 * 作者に無断で改変、再配布、商用利用、18禁製品利用など無問題です。
 * ただし、プラグイン本体の著作権表示と本許諾表示は残しておいてください。
 * また、本プラグインを使って何か問題が起きても、作者は一切関知しません。
 */

(function(){
    'use strict';

    var pName = "FAR_SelfSwitchCustom";
    var parameters = PluginManager.parameters(pName);

    //@paramの型再設定用関数（ツクールの仕様でparameters通した時点でstring型になっている）
    var getParamNumber = function(param) { return Number(param) || 0; }
    var getParamBoolean = function(param) { return param.toLowerCase() === 'true'; }
    var getParamArray = function(param){ return !Object.keys(param).length ? [] : JSON.parse(param); }

    //パラメータを変数に設定
    var applyFlagSwitch = getParamNumber(parameters['ApplyFlag']);


    var _Game_SelfSwitches_prototype_setValue = Game_SelfSwitches.prototype.setValue;
    Game_SelfSwitches.prototype.setValue = function(key, value) {
        //指定したスイッチ番号がfalseの場合は通常処理
        if(!$gameSwitches.value(applyFlagSwitch)){
            return _Game_SelfSwitches_prototype_setValue.call(this, key, value);
        }

        if (value) {
            this._data[key] = true;
        } else {
            delete this._data[key];
        }
        var eventId = key[1];
        this.onChange(eventId);
     };

     var _Game_SelfSwitches_prototype_onChange = Game_SelfSwitches.prototype.onChange;
     Game_SelfSwitches.prototype.onChange = function(eventId) {
        //指定したスイッチ番号がfalseの場合は通常処理
        if(!$gameSwitches.value(applyFlagSwitch)){
            return _Game_SelfSwitches_prototype_onChange.call(this, eventId);
        }

        if($gameMap.event(eventId)) $gameMap.event(eventId).refresh();
     };

     var _Game_Map_prototype_requestRefresh = Game_Map.prototype.requestRefresh;
     Game_Map.prototype.requestRefresh = function(eventId) {
        //指定したスイッチ番号がfalseの場合は通常処理
        if(!$gameSwitches.value(applyFlagSwitch)){
            return _Game_Map_prototype_requestRefresh.call(this, eventId);
        }

        this._needsRefresh = true;
        this._needsRefreshAppoint = eventId || 0;
     };
     
     var _Game_Map_prototype_refresh = Game_Map.prototype.refresh;
     Game_Map.prototype.refresh = function() {
        //指定したスイッチ番号がfalseの場合は通常処理
        if(!$gameSwitches.value(applyFlagSwitch)){
            return _Game_Map_prototype_refresh.call(this);
        }

        var appoint = this._needsRefreshAppoint;
        this.events().forEach(function(event) {
            if(appoint > 0 && appoint != event.eventId()) return;
            event.refresh();
        });
        this._commonEvents.forEach(function(event) {
            event.refresh();
        });
        this.refreshTileEvents();
        this._needsRefresh = false;
     };

})();